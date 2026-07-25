const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Google Drive Backup Service
 * Performs direct REST API v3 uploads for database JSON dumps into Google Drive Folder
 */
const GoogleDriveService = {
  isEnabled: () => {
    return Boolean(process.env.GDRIVE_FOLDER_ID);
  },

  getAccessToken: async () => {
    const refreshToken = process.env.GDRIVE_REFRESH_TOKEN;
    const clientId = process.env.GDRIVE_CLIENT_ID;
    const clientSecret = process.env.GDRIVE_CLIENT_SECRET;

    if (process.env.GDRIVE_ACCESS_TOKEN) {
      return process.env.GDRIVE_ACCESS_TOKEN;
    }

    if (!refreshToken || !clientId || !clientSecret) {
      return null;
    }

    return new Promise((resolve) => {
      const postData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString();

      const req = https.request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(data.access_token || null);
          } catch (_) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    });
  },

  uploadBackupSnapshot: async (filePath, filename) => {
    try {
      const folderId = process.env.GDRIVE_FOLDER_ID || '1d-ca4wnFG0cwyy_b0Ry-cKnhr9b_G3Yl';
      if (!fs.existsSync(filePath)) {
        return { success: false, reason: 'FILE_NOT_FOUND' };
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const accessToken = await GoogleDriveService.getAccessToken();

      if (!accessToken) {
        console.log(`[Google Drive Backup] Snapshot "${filename}" saved in server/data/backups/ (Add GDRIVE_REFRESH_TOKEN in .env for direct cloud sync).`);
        return {
          success: true,
          localOnly: true,
          message: `Snapshot "${filename}" saved in server/data/backups/! Add GDRIVE_REFRESH_TOKEN to .env for direct Google Drive sync.`,
          filename
        };
      }

      console.log(`[Google Drive API] Uploading ${filename} to Google Drive folder: ${folderId}...`);

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";

      const metadata = {
        name: filename,
        mimeType: 'application/json',
        parents: [folderId]
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelim;

      return new Promise((resolve) => {
        const req = https.request({
          hostname: 'www.googleapis.com',
          path: '/upload/drive/v3/files?uploadType=multipart',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary="${boundary}"`,
            'Content-Length': Buffer.byteLength(multipartRequestBody)
          }
        }, (res) => {
          let body = '';
          res.on('data', chunk => { body += chunk; });
          res.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`[Google Drive API Success] Uploaded ${filename} (ID: ${data.id}) to Google Drive folder ${folderId}!`);
                resolve({ success: true, fileId: data.id, filename });
              } else {
                console.warn(`[Google Drive API Notice] HTTP ${res.statusCode}:`, data.error?.message || body);
                resolve({ success: true, localOnly: true, filename, note: data.error?.message });
              }
            } catch (_) {
              resolve({ success: true, localOnly: true, filename });
            }
          });
        });

        req.on('error', (err) => {
          console.error('[Google Drive API Network Error]', err.message);
          resolve({ success: true, localOnly: true, filename });
        });

        req.write(multipartRequestBody);
        req.end();
      });
    } catch (err) {
      console.error('[Google Drive Backup Error]', err.message);
      return { success: false, error: err.message };
    }
  }
};

module.exports = GoogleDriveService;
