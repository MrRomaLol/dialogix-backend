const db = require("../database/db");
const settingNames = ["user_status", "app_bg", "app_lang"];
const defaultValues = ["online", "", "en"];

const addUserSettingQuery = `
INSERT INTO user_settings (user_id, setting_name, setting_value)
VALUES(?, ?, ?);
`

const updateUserSettingQuery = `
UPDATE user_settings
SET setting_value = ?
WHERE 
    user_id = ? AND setting_name = ?;
`

function getUserSettings(userId) {
    return new Promise((resolve, reject) => {
        const placeholders = settingNames.map(() => '?').join(', ');

        const query = `SELECT id, setting_name, setting_value FROM user_settings WHERE user_id = ? AND setting_name IN (${placeholders})`;
        const params = [userId, ...settingNames];

        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const settings = {};
                rows.forEach(row => {
                    settings[row.setting_name] = {id: row.id, value: row.setting_value};
                });

                settingNames.forEach((settingName, index) => {
                    if (!settings.hasOwnProperty(settingName)) {
                        settings[settingName] = {id: null, value: defaultValues[index]};
                    }
                });

                resolve(settings);
            }
        });
    });
}

function addUserSetting(userId, settingName, settingValue, cb) {
    db.run(addUserSettingQuery, [userId, settingName, settingValue], (err, result) => {
        if (err) {
            console.log(err);
        }
        cb(result);
    })
}

function updateUserSetting(id, userId, settingName, settingValue, cb) {
    if (!id) {
        return addUserSetting(userId, settingName, settingValue, (result) => {
            cb({
                id: result.lastID,
                settingName,
                settingValue
            });
        });
    }

    db.run(updateUserSettingQuery, [settingValue, userId, settingName], (err) => {
        cb({
            id,
            settingName,
            settingValue
        });
    })
}

module.exports = {getUserSettings, updateUserSetting}