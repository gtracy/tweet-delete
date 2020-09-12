
const {google} = require('googleapis');
const util = require('util')

const Google = function() {
    var self = this;

    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.init = async function() {

        self.oauth2Client = await auth.getClient();            
        this.sheets = google.sheets({
            version: 'v4',
            auth: self.oauth2Client,
        });
    };    
};

/**
 * Append a list of data to a spreadsheet
 */
Google.prototype.postRowData = async function(sheetID, row_data) {

    try {

        let response = await this.sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: process.env.GOOGLE_SHEET_RANGE,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
              values: [ row_data ]
            }
        });
        return response.data.values;

    } catch (e) {
        console.log('ERROR :: Google API rejected : ' + e);
        throw(e);
    }

}

module.exports = Google;
