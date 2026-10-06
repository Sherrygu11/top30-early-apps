// ============================================================
// 界面静态文案的中英文对照表 / Static UI string translations (zh / en)
// ============================================================

const UI_STRINGS = {
  zh: {
    pageTitle: "Top 30 美本早申信息对比",
    brandText: "Top 30 早申对比",
    themeToggleTitle: "切换深色/浅色模式",
    langToggleLabel: "EN",
    langToggleTitle: "切换到英文",

    heroEyebrow: "📅 2026-2027 申请季（Fall 2027 入学）· 截止日期已更新确认",
    heroTitleHtml: "Top 30 美国大学<br /><span>早申（ED / EA / REA）</span>信息一览",
    heroDesc: "集中对比 Top 30 院校的早申类型、截止日期、放榜时间与录取率，帮助你快速梳理早申策略。截止日期已对照各校官网及权威升学机构更新为 2026-2027 申请季（Fall 2027 入学）的最新确认信息；历史录取率数据（近三年）仍为示例参考。",

    statTotalLabel: "收录院校数",
    statAvgLabel: "平均早申录取率",
    statBindingLabel: "绑定 ED 院校数",
    statNoEarlyLabel: "无早申计划院校",

    timelineNoteHtml: "<b>时间说明：</b>页面中「截止日期」均指 <b>2026年</b>（今年秋季）提交申请的时间；「放榜时间」跨 <b>2026年12月～2027年上半年</b>；被录取学生将于 <b>2027年9月（Fall 2027）</b>正式入学 —— 即通常所说的「27Fall」或「2031届」。所有日期已在下方标注具体年份。",

    searchPlaceholder: "搜索学校名称或地区…",
    chipAll: "全部",
    chipED: "ED 绑定",
    chipEA: "EA 非限制",
    chipREA: "REA 限制性",
    chipNONE: "无早申",

    viewCard: "卡片",
    viewTable: "表格",

    thRank: "排名",
    thSchool: "学校",
    thType: "早申类型",
    thDeadline: "截止日期",
    thDecision: "放榜时间",
    thEarlyRate: "早申录取率",
    thRegularRate: "常规录取率",
    thOverallRate: "总体录取率",

    resultCountHtml: (total, shown) => `共 <b>${total}</b> 所院校，当前显示 <b>${shown}</b> 所`,
    emptyStateHtml: `<div class="emoji">🔍</div>没有找到匹配的学校<br/>试试调整搜索词或筛选条件`,

    cardRateEarly: "早申",
    cardRateRegular: "常规",
    cardTrendEarly: "近3年早申",
    cardTrendRegular: "近3年常规",
    cardDeadlinePrefix: "截止",
    cardDecisionPrefix: "放榜",

    modalDeadlineLabel: "早申截止",
    modalDecisionLabel: "放榜时间",
    modalEarlyRateLabel: "早申录取率",
    modalRegularRateLabel: "常规录取率",
    modalOverallRateLabel: "总体录取率",
    modalTuitionLabel: "年学费（估算）",
    modalHistoryTitle: "近三年录取率对比",
    modalHistoryYear: "年份",
    modalHistoryEarly: "早申录取率",
    modalHistoryRegular: "常规录取率",

    commentsTitle: "申请经验留言",
    commentsLoading: "加载中…",
    commentsEmpty: "还没有留言，来写第一条吧",
    commentsUnavailable: "留言功能暂时不可用",
    commentNickname: "昵称（可不填）",
    commentPlaceholder: "分享你的申请经验或问题（最多 500 字）",
    commentSubmit: "发布留言",
    commentSending: "发布中…",
    commentError: "发布失败，请稍后再试",
    commentRateLimit: "留言太频繁了，请稍后再试",
    commentAnonymous: "匿名",

    footerHtml: (year) => `© ${year} Top 30 早申对比 · 截止日期已更新为 2026-2027 申请季（Fall 2027 入学）确认信息；录取率历史数据仍为示例参考，具体请以各校官网最新公布信息为准`,
  },

  en: {
    pageTitle: "Top 30 US Early Application Comparison",
    brandText: "Top 30 Early Apps",
    themeToggleTitle: "Toggle dark / light mode",
    langToggleLabel: "中文",
    langToggleTitle: "Switch to Chinese",

    heroEyebrow: "📅 2026-2027 Cycle (Fall 2027 Entry) · Deadlines Confirmed",
    heroTitleHtml: "Top 30 US Universities<br /><span>Early Applications (ED / EA / REA)</span> Overview",
    heroDesc: "Compare early application types, deadlines, decision dates, and acceptance rates across the Top 30 schools to help you plan your early application strategy. Deadlines have been checked against each school's official site and leading admissions consultancies for the 2026-2027 cycle (Fall 2027 entry); the 3-year acceptance-rate history is still illustrative sample data.",

    statTotalLabel: "Schools Covered",
    statAvgLabel: "Avg. Early Acceptance Rate",
    statBindingLabel: "Binding ED Schools",
    statNoEarlyLabel: "No Early Program",

    timelineNoteHtml: "<b>Timeline note:</b> every “Deadline” on this page refers to submission in <b>2026</b> (this fall); “Decision date” spans <b>December 2026 through mid-2027</b>; admitted students will enroll in <b>September 2027 (Fall 2027)</b> — commonly called “27Fall” or the “Class of 2031.” Every date below already includes its year.",

    searchPlaceholder: "Search by school name or location…",
    chipAll: "All",
    chipED: "Binding ED",
    chipEA: "Non-Restrictive EA",
    chipREA: "Restrictive REA",
    chipNONE: "No Early Plan",

    viewCard: "Cards",
    viewTable: "Table",

    thRank: "Rank",
    thSchool: "School",
    thType: "Early Plan",
    thDeadline: "Deadline",
    thDecision: "Decision Date",
    thEarlyRate: "Early Rate",
    thRegularRate: "Regular Rate",
    thOverallRate: "Overall Rate",

    resultCountHtml: (total, shown) => `<b>${total}</b> schools total, showing <b>${shown}</b>`,
    emptyStateHtml: `<div class="emoji">🔍</div>No matching schools found<br/>Try adjusting your search or filters`,

    cardRateEarly: "Early",
    cardRateRegular: "Regular",
    cardTrendEarly: "3-yr Early Trend",
    cardTrendRegular: "3-yr Regular Trend",
    cardDeadlinePrefix: "Due",
    cardDecisionPrefix: "Decision",

    modalDeadlineLabel: "Early Deadline",
    modalDecisionLabel: "Decision Date",
    modalEarlyRateLabel: "Early Acceptance Rate",
    modalRegularRateLabel: "Regular Acceptance Rate",
    modalOverallRateLabel: "Overall Acceptance Rate",
    modalTuitionLabel: "Annual Tuition (est.)",
    modalHistoryTitle: "3-Year Acceptance Rate Comparison",
    modalHistoryYear: "Year",
    modalHistoryEarly: "Early Rate",
    modalHistoryRegular: "Regular Rate",

    commentsTitle: "Application Notes",
    commentsLoading: "Loading…",
    commentsEmpty: "No comments yet — be the first to share",
    commentsUnavailable: "Comments are temporarily unavailable",
    commentNickname: "Nickname (optional)",
    commentPlaceholder: "Share your experience or ask a question (max 500 characters)",
    commentSubmit: "Post comment",
    commentSending: "Posting…",
    commentError: "Could not post — please try again later",
    commentRateLimit: "You're posting too fast — please wait a bit",
    commentAnonymous: "Anonymous",

    footerHtml: (year) => `© ${year} Top 30 Early Apps · Deadlines updated to confirmed 2026-2027 cycle (Fall 2027 entry) information; acceptance-rate history remains illustrative sample data — please verify with each school's official site`,
  },
};
