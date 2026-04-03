const axios = require("axios");

const BASE_URL = "http://dongdev.click/api/down/media";

module.exports.config = {
  name: "autodown",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "N1SA9",
  description: "Auto download media from Facebook, TikTok, YouTube, Instagram, Bilibili, Douyin, CapCut, Threads",
  commandCategory: "Utility",
  usages: "[send link]",
  cooldowns: 5,
  prefix: true
};

// ================= STREAM HELPER =================
const streamFile = async (url, ext = "jpg") => {
  try {
    const res = await axios.get(url, { responseType: "stream" });
    res.data.path = `tmp.${ext}`;
    return res.data;
  } catch (e) {
    return null;
  }
};

// ================= HANDLE EVENT =================
module.exports.handleEvent = async ({ api, event }) => {
  if (event.senderID === api.getCurrentUserID()) return;

  const body = event.body || "";
  const urls = body.match(/https?:\/\/[^\s]+/g);

  if (!urls) return;

  const send = (msg) =>
    api.sendMessage(msg, event.threadID, event.messageID);

  const head = (app) =>
    `[ AUTODOWN - ${app} ]\n────────────────`;

  for (const url of urls) {

    // ================= FACEBOOK =================
    if (
      /facebook\.com|fb\.watch/.test(url)
    ) {
      try {
        const res = (
          await axios.get(`${BASE_URL}?url=${encodeURIComponent(url)}`)
        ).data;

        if (!res.attachments?.length) return;

        let attachments = [];

        if (res.queryStorieID) {
          const match = res.attachments.find(
            (i) => i.id == res.queryStorieID
          );

          if (match?.type === "Video") {
            attachments.push(
              await streamFile(match.url.hd || match.url.sd, "mp4")
            );
          } else if (match?.type === "Photo") {
            attachments.push(await streamFile(match.url, "jpg"));
          }
        } else {
          for (const item of res.attachments) {
            if (item.type === "Video") {
              attachments.push(
                await streamFile(item.url.hd || item.url.sd, "mp4")
              );
            } else if (item.type === "Photo") {
              attachments.push(await streamFile(item.url, "jpg"));
            }
          }
        }

        return send({
          body:
            `${head("FACEBOOK")}\n` +
            `⩺ Title: ${res.message || "No title"}\n` +
            `${res.like ? `⩺ Likes: ${res.like}\n` : ""}` +
            `${res.comment ? `⩺ Comments: ${res.comment}\n` : ""}` +
            `${res.share ? `⩺ Shares: ${res.share}\n` : ""}` +
            `⩺ Author: ${res.author || "Unknown"}`,
          attachment: attachments.filter(Boolean)
        });
      } catch (e) {}
    }

    // ================= OTHER PLATFORMS =================
    else if (
      /(tiktok\.com|twitter\.com|x\.com|youtube\.com|instagram\.com|bilibili\.com|douyin\.com|capcut\.com|threads\.net)/.test(
        url
      )
    ) {
      try {
        const platform =
          /tiktok\.com/.test(url)
            ? "TIKTOK"
            : /twitter\.com|x\.com/.test(url)
            ? "TWITTER"
            : /youtube\.com/.test(url)
            ? "YOUTUBE"
            : /instagram\.com/.test(url)
            ? "INSTAGRAM"
            : /bilibili\.com/.test(url)
            ? "BILIBILI"
            : /douyin\.com/.test(url)
            ? "DOUYIN"
            : /capcut\.com/.test(url)
            ? "CAPCUT"
            : /threads\.net/.test(url)
            ? "THREADS"
            : "UNKNOWN";

        const res = (
          await axios.get(`${BASE_URL}?url=${encodeURIComponent(url)}`)
        ).data;

        if (!res.attachments?.length) return;

        let attachments = [];

        for (const item of res.attachments) {
          if (item.type === "Video") {
            attachments.push(await streamFile(item.url, "mp4"));
          } else if (item.type === "Photo") {
            attachments.push(await streamFile(item.url, "jpg"));
          } else if (item.type === "Audio") {
            attachments.push(await streamFile(item.url, "mp3"));
          }
        }

        return send({
          body:
            `${head(platform)}\n` +
            `⩺ Title: ${res.message || "No title"}`,
          attachment: attachments.filter(Boolean)
        });
      } catch (e) {}
    }
  }
};

// ================= RUN COMMAND =================
module.exports.run = async () => {};
