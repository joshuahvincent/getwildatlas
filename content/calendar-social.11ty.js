// /calendar/<slug>/social.json for every live calendar page with an
// `animalDay` block — the contract the calendar-social Worker consumes.
// See docs/CALENDAR_SOCIAL_WORKER.md (Phase 1). `social.facts` in a page's
// front matter holds the three post-ready facts; empty = Worker won't post.
const { socialPayload } = require("../lib/calendar-social.js");

exports.data = {
  pagination: {
    data: "collections.calendarPage",
    size: 1,
    alias: "item",
    before: (items) => items.filter((i) => i.data.animalDay),
  },
  permalink: (data) => `/calendar/${data.item.page.fileSlug}/social.json`,
  eleventyExcludeFromCollections: true,
};

exports.render = function (data) {
  return JSON.stringify(socialPayload(data.item, data.animalDays), null, 2) + "\n";
};
