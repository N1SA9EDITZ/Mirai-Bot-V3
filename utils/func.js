const crypto = require('crypto');
const os = require("os");
const { createWriteStream } = require('fs');
const axios = require('axios');

const utils = {

    throwError(command, threadID, messageID) {
        try {
            return global.client.api.sendMessage(
                `⚠️ Command Error: ${command}`,
                threadID,
                messageID
            );
        } catch (e) {
            console.log(e);
        }
    },

    parseCookies(cookies) {
        return cookies.split(';').map(pair => {
            const [key, value] = pair.trim().split('=');
            return {
                key,
                value,
                domain: "facebook.com",
                path: "/"
            };
        });
    },

    downloadFile: async (url, path) => {
        const res = await axios.get(url, { responseType: "stream" });
        const writer = createWriteStream(path);
        res.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    },

    getContent: async (url) => {
        try {
            return await axios.get(url);
        } catch (e) {
            console.log("Fetch error:", e.message);
        }
    },

    randomString(length) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    },

    AES: {
        encrypt(key, iv, data) {
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
            let encrypted = cipher.update(data);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return encrypted.toString('hex');
        },

        decrypt(key, iv, data) {
            const encrypted = Buffer.from(data, "hex");
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        }
    },

    homeDir() {
        return [os.homedir(), process.platform];
    }
};

module.exports = utils;
