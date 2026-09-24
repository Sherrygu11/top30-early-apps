// ============================================================
// 示例数据：Top 30 美国大学早申信息对比 / Top 30 US early application comparison
// 数据为示例占位内容，非官方真实数据，后续可自行替换修改
// Deadlines confirmed for the 2026-2027 cycle (Fall 2027 entry); rate history is illustrative sample data.
// 字段说明：
//   rank        综合排名（示例）
//   name        中文校名
//   nameEn      英文校名
//   location    所在地（中文）
//   type        早申类型代码：ED / ED2 / EA / REA / NONE
//   typeLabel   早申类型中文说明（未在界面直接展示，仅作数据说明）
//   binding     是否为绑定录取
//   deadline    早申截止日期（中文）
//   decision    放榜时间（中文）
//   earlyRate   最近一年早申录取率 (%)
//   regularRate 最近一年常规录取率 (%)
//   overallRate 最近一年总体录取率 (%)
//   tuition     年学费（示例，含杂费估算，中文单位说明）
//   notes       备注 / 限制说明（中文）
//   history     近三年数据 [{ year, earlyRate, regularRate }]
//   en          英文版对应字段：{ location, deadline, decision, tuition, notes }
// ============================================================

const SCHOOL_DATA = [
  { rank: 1, name: "普林斯顿大学", nameEn: "Princeton University", location: "新泽西州 · 普林斯顿", type: "REA", typeLabel: "限制性早申 REA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 12.7, regularRate: 3.6, overallRate: 5.7, tuition: "$62,400", notes: "限制性早申请，不可同时申请其他学校 ED/EA（公立大学 EA 除外）",
    en: { location: "Princeton, NJ", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$62,400", notes: "Restrictive early action — may not simultaneously apply ED/EA to other schools (public university EA excepted)." },
    history: [ { year: 2023, earlyRate: 15.0, regularRate: 4.0 }, { year: 2024, earlyRate: 13.8, regularRate: 3.8 }, { year: 2025, earlyRate: 12.7, regularRate: 3.6 } ] },
  { rank: 2, name: "麻省理工学院", nameEn: "Massachusetts Institute of Technology", location: "马萨诸塞州 · 剑桥", type: "EA", typeLabel: "非限制性早申 EA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 4.7, regularRate: 3.4, overallRate: 3.7, tuition: "$61,990", notes: "非绑定，可同时申请任意数量其他学校的早申",
    en: { location: "Cambridge, MA", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$61,990", notes: "Non-binding — may apply early to any number of other schools." },
    history: [ { year: 2023, earlyRate: 5.5, regularRate: 3.7 }, { year: 2024, earlyRate: 5.1, regularRate: 3.6 }, { year: 2025, earlyRate: 4.7, regularRate: 3.4 } ] },
  { rank: 3, name: "哈佛大学", nameEn: "Harvard University", location: "马萨诸塞州 · 剑桥", type: "REA", typeLabel: "限制性早申 REA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 7.9, regularRate: 3.2, overallRate: 3.6, tuition: "$59,320", notes: "限制性早申请（REA/SCEA），不可申请其他私立大学早申",
    en: { location: "Cambridge, MA", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$59,320", notes: "Restrictive early action (REA/SCEA) — may not apply early to other private universities." },
    history: [ { year: 2023, earlyRate: 9.3, regularRate: 3.5 }, { year: 2024, earlyRate: 8.6, regularRate: 3.4 }, { year: 2025, earlyRate: 7.9, regularRate: 3.2 } ] },
  { rank: 4, name: "斯坦福大学", nameEn: "Stanford University", location: "加利福尼亚州 · 斯坦福", type: "REA", typeLabel: "限制性早申 REA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 6.6, regularRate: 3.9, overallRate: 3.9, tuition: "$62,484", notes: "限制性早申请，录取率常年低于所有藤校",
    en: { location: "Stanford, CA", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$62,484", notes: "Restrictive early action — acceptance rate is consistently among the lowest of any top school." },
    history: [ { year: 2023, earlyRate: 7.8, regularRate: 4.3 }, { year: 2024, earlyRate: 7.2, regularRate: 4.1 }, { year: 2025, earlyRate: 6.6, regularRate: 3.9 } ] },
  { rank: 5, name: "耶鲁大学", nameEn: "Yale University", location: "康涅狄格州 · 纽黑文", type: "REA", typeLabel: "限制性早申 REA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 10.9, regularRate: 3.7, overallRate: 4.6, tuition: "$64,700", notes: "限制性早申请（SCEA）",
    en: { location: "New Haven, CT", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$64,700", notes: "Restrictive early action (SCEA)." },
    history: [ { year: 2023, earlyRate: 12.9, regularRate: 4.1 }, { year: 2024, earlyRate: 11.9, regularRate: 3.9 }, { year: 2025, earlyRate: 10.9, regularRate: 3.7 } ] },
  { rank: 6, name: "宾夕法尼亚大学", nameEn: "University of Pennsylvania", location: "宾夕法尼亚州 · 费城", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 15.0, regularRate: 4.5, overallRate: 5.9, tuition: "$61,710", notes: "录取后必须入学，仅可申请一所学校 ED",
    en: { location: "Philadelphia, PA", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$61,710", notes: "Binding upon admission — may only apply ED to one school." },
    history: [ { year: 2023, earlyRate: 17.7, regularRate: 5.0 }, { year: 2024, earlyRate: 16.4, regularRate: 4.7 }, { year: 2025, earlyRate: 15.0, regularRate: 4.5 } ] },
  { rank: 7, name: "加州理工学院", nameEn: "California Institute of Technology", location: "加利福尼亚州 · 帕萨迪纳", type: "REA", typeLabel: "限制性早申 REA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 8.0, regularRate: 2.7, overallRate: 3.3, tuition: "$60,864", notes: "理工科方向，标化成绩权重较高",
    en: { location: "Pasadena, CA", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$60,864", notes: "STEM-focused — standardized test scores are weighted heavily." },
    history: [ { year: 2023, earlyRate: 9.4, regularRate: 3.0 }, { year: 2024, earlyRate: 8.7, regularRate: 2.8 }, { year: 2025, earlyRate: 8.0, regularRate: 2.7 } ] },
  { rank: 8, name: "杜克大学", nameEn: "Duke University", location: "北卡罗来纳州 · 达勒姆", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 16.7, regularRate: 5.1, overallRate: 6.6, tuition: "$63,054", notes: "提供 ED1（11月）与 ED2（1月）两轮",
    en: { location: "Durham, NC", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$63,054", notes: "Offers both ED1 (November) and ED2 (January) rounds." },
    history: [ { year: 2023, earlyRate: 19.7, regularRate: 5.6 }, { year: 2024, earlyRate: 18.2, regularRate: 5.4 }, { year: 2025, earlyRate: 16.7, regularRate: 5.1 } ] },
  { rank: 9, name: "布朗大学", nameEn: "Brown University", location: "罗德岛州 · 普罗维登斯", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 14.6, regularRate: 3.8, overallRate: 5.1, tuition: "$68,594", notes: "无 ED2，仅一轮绑定早申",
    en: { location: "Providence, RI", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$68,594", notes: "No ED2 — a single binding early round only." },
    history: [ { year: 2023, earlyRate: 17.2, regularRate: 4.2 }, { year: 2024, earlyRate: 15.9, regularRate: 4.0 }, { year: 2025, earlyRate: 14.6, regularRate: 3.8 } ] },
  { rank: 10, name: "约翰霍普金斯大学", nameEn: "Johns Hopkins University", location: "马里兰州 · 巴尔的摩", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月1日 / 2027年1月2日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 21.8, regularRate: 6.0, overallRate: 7.1, tuition: "$62,840", notes: "提供 ED1 与 ED2 两轮绑定申请",
    en: { location: "Baltimore, MD", deadline: "Nov 1, 2026 / Jan 2, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$62,840", notes: "Offers both ED1 and ED2 binding rounds." },
    history: [ { year: 2023, earlyRate: 25.7, regularRate: 6.6 }, { year: 2024, earlyRate: 23.8, regularRate: 6.3 }, { year: 2025, earlyRate: 21.8, regularRate: 6.0 } ] },
  { rank: 11, name: "西北大学", nameEn: "Northwestern University", location: "伊利诺伊州 · 埃文斯顿", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 20.8, regularRate: 5.9, overallRate: 7.7, tuition: "$63,468", notes: "提供 ED1 与 ED2 两轮",
    en: { location: "Evanston, IL", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$63,468", notes: "Offers both ED1 and ED2 rounds." },
    history: [ { year: 2023, earlyRate: 24.5, regularRate: 6.5 }, { year: 2024, earlyRate: 22.7, regularRate: 6.2 }, { year: 2025, earlyRate: 20.8, regularRate: 5.9 } ] },
  { rank: 12, name: "哥伦比亚大学", nameEn: "Columbia University", location: "纽约州 · 纽约", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 14.0, regularRate: 3.5, overallRate: 3.9, tuition: "$68,400", notes: "仅一轮绑定早申，无 ED2",
    en: { location: "New York, NY", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$68,400", notes: "A single binding early round only — no ED2." },
    history: [ { year: 2023, earlyRate: 16.5, regularRate: 3.9 }, { year: 2024, earlyRate: 15.3, regularRate: 3.7 }, { year: 2025, earlyRate: 14.0, regularRate: 3.5 } ] },
  { rank: 13, name: "康奈尔大学", nameEn: "Cornell University", location: "纽约州 · 伊萨卡", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 18.2, regularRate: 6.7, overallRate: 7.5, tuition: "$66,398", notes: "不同学院录取率差异较大",
    en: { location: "Ithaca, NY", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$66,398", notes: "Acceptance rates vary significantly by college." },
    history: [ { year: 2023, earlyRate: 21.5, regularRate: 7.4 }, { year: 2024, earlyRate: 19.8, regularRate: 7.0 }, { year: 2025, earlyRate: 18.2, regularRate: 6.7 } ] },
  { rank: 14, name: "芝加哥大学", nameEn: "University of Chicago", location: "伊利诺伊州 · 芝加哥", type: "EA", typeLabel: "早申 EA + ED1/ED2", binding: false, deadline: "2026年11月1日 / 2027年1月2日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 22.3, regularRate: 4.8, overallRate: 5.4, tuition: "$64,824", notes: "同时提供非绑定 EA 与绑定 ED1/ED2",
    en: { location: "Chicago, IL", deadline: "Nov 1, 2026 / Jan 2, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$64,824", notes: "Offers both non-binding EA and binding ED1/ED2." },
    history: [ { year: 2023, earlyRate: 26.3, regularRate: 5.3 }, { year: 2024, earlyRate: 24.3, regularRate: 5.0 }, { year: 2025, earlyRate: 22.3, regularRate: 4.8 } ] },
  { rank: 15, name: "加州大学洛杉矶分校", nameEn: "University of California, Los Angeles", location: "加利福尼亚州 · 洛杉矶", type: "NONE", typeLabel: "无早申计划", binding: false, deadline: "2026年11月30日（常规）", decision: "2027年3月中下旬", earlyRate: null, regularRate: 8.6, overallRate: 8.6, tuition: "$46,899（州外）", notes: "UC 系统统一时间提交，不设早申轮次",
    en: { location: "Los Angeles, CA", deadline: "Nov 30, 2026 (Regular)", decision: "Mid-to-late March 2027", tuition: "$46,899 (out-of-state)", notes: "The UC system uses a single application deadline — there are no early rounds." },
    history: [ { year: 2023, earlyRate: null, regularRate: 9.5 }, { year: 2024, earlyRate: null, regularRate: 9.0 }, { year: 2025, earlyRate: null, regularRate: 8.6 } ] },
  { rank: 16, name: "加州大学伯克利分校", nameEn: "University of California, Berkeley", location: "加利福尼亚州 · 伯克利", type: "NONE", typeLabel: "无早申计划", binding: false, deadline: "2026年11月30日（常规）", decision: "2027年3月下旬", earlyRate: null, regularRate: 11.4, overallRate: 11.4, tuition: "$48,465（州外）", notes: "UC 系统统一时间提交，不设早申轮次",
    en: { location: "Berkeley, CA", deadline: "Nov 30, 2026 (Regular)", decision: "Late March 2027", tuition: "$48,465 (out-of-state)", notes: "The UC system uses a single application deadline — there are no early rounds." },
    history: [ { year: 2023, earlyRate: null, regularRate: 12.5 }, { year: 2024, earlyRate: null, regularRate: 12.0 }, { year: 2025, earlyRate: null, regularRate: 11.4 } ] },
  { rank: 17, name: "莱斯大学", nameEn: "Rice University", location: "德克萨斯州 · 休斯顿", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月1日 / 2027年1月4日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 16.8, regularRate: 6.7, overallRate: 8.5, tuition: "$58,128", notes: "提供 ED1 与 ED2 两轮绑定申请",
    en: { location: "Houston, TX", deadline: "Nov 1, 2026 / Jan 4, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$58,128", notes: "Offers both ED1 and ED2 binding rounds." },
    history: [ { year: 2023, earlyRate: 19.8, regularRate: 7.4 }, { year: 2024, earlyRate: 18.3, regularRate: 7.0 }, { year: 2025, earlyRate: 16.8, regularRate: 6.7 } ] },
  { rank: 18, name: "圣母大学", nameEn: "University of Notre Dame", location: "印第安纳州 · 圣母城", type: "REA", typeLabel: "限制性早申 REA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 20.4, regularRate: 10.1, overallRate: 12.9, tuition: "$62,693", notes: "限制性早申请，非绑定",
    en: { location: "Notre Dame, IN", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$62,693", notes: "Restrictive early action — non-binding." },
    history: [ { year: 2023, earlyRate: 24.1, regularRate: 11.1 }, { year: 2024, earlyRate: 22.2, regularRate: 10.6 }, { year: 2025, earlyRate: 20.4, regularRate: 10.1 } ] },
  { rank: 19, name: "范德堡大学", nameEn: "Vanderbilt University", location: "田纳西州 · 纳什维尔", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月1日 / 2027年1月1日", decision: "2026年12月中旬 / 2027年2月上旬", earlyRate: 16.8, regularRate: 5.0, overallRate: 6.5, tuition: "$62,404", notes: "提供 ED1 与 ED2 两轮绑定申请",
    en: { location: "Nashville, TN", deadline: "Nov 1, 2026 / Jan 1, 2027", decision: "Mid-December 2026 / Early February 2027", tuition: "$62,404", notes: "Offers both ED1 and ED2 binding rounds." },
    history: [ { year: 2023, earlyRate: 19.8, regularRate: 5.5 }, { year: 2024, earlyRate: 18.3, regularRate: 5.3 }, { year: 2025, earlyRate: 16.8, regularRate: 5.0 } ] },
  { rank: 20, name: "圣路易斯华盛顿大学", nameEn: "Washington University in St. Louis", location: "密苏里州 · 圣路易斯", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月3日 / 2027年1月2日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 25.1, regularRate: 10.5, overallRate: 12.0, tuition: "$64,240", notes: "2026-27申请季（Fall 2027入学）ED1截止日顺延至11月3日（11月1日为周日）；ED 录取率显著高于常规轮",
    en: { location: "St. Louis, MO", deadline: "Nov 3, 2026 / Jan 2, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$64,240", notes: "For the 2026-27 cycle (Fall 2027 entry), the ED1 deadline is pushed to Nov 3 since Nov 1 falls on a Sunday. ED acceptance rate is notably higher than the regular round." },
    history: [ { year: 2023, earlyRate: 29.6, regularRate: 11.6 }, { year: 2024, earlyRate: 27.4, regularRate: 11.0 }, { year: 2025, earlyRate: 25.1, regularRate: 10.5 } ] },
  { rank: 21, name: "埃默里大学", nameEn: "Emory University", location: "佐治亚州 · 亚特兰大", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月1日 / 2027年1月1日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 25.5, regularRate: 10.5, overallRate: 11.5, tuition: "$60,392", notes: "提供 ED1 与 ED2 两轮绑定申请",
    en: { location: "Atlanta, GA", deadline: "Nov 1, 2026 / Jan 1, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$60,392", notes: "Offers both ED1 and ED2 binding rounds." },
    history: [ { year: 2023, earlyRate: 30.1, regularRate: 11.6 }, { year: 2024, earlyRate: 27.8, regularRate: 11.0 }, { year: 2025, earlyRate: 25.5, regularRate: 10.5 } ] },
  { rank: 22, name: "乔治城大学", nameEn: "Georgetown University", location: "华盛顿特区", type: "EA", typeLabel: "限制性早申 EA", binding: false, deadline: "2026年11月1日", decision: "2026年12月中旬", earlyRate: 12.0, regularRate: 10.4, overallRate: 12.0, tuition: "$64,896", notes: "限制性 EA，非绑定但限制申请其他学校早申",
    en: { location: "Washington, DC", deadline: "Nov 1, 2026", decision: "Mid-December 2026", tuition: "$64,896", notes: "Restrictive EA — non-binding, but limits applying early elsewhere." },
    history: [ { year: 2023, earlyRate: 14.2, regularRate: 11.4 }, { year: 2024, earlyRate: 13.1, regularRate: 10.9 }, { year: 2025, earlyRate: 12.0, regularRate: 10.4 } ] },
  { rank: 23, name: "密歇根大学安娜堡分校", nameEn: "University of Michigan, Ann Arbor", location: "密歇根州 · 安娜堡", type: "EA", typeLabel: "非限制性早申 EA", binding: false, deadline: "2026年11月1日", decision: "2027年1月下旬起", earlyRate: 26.1, regularRate: 15.0, overallRate: 17.7, tuition: "$58,510（州外）", notes: "分批次放榜，早申仅提前获知结果",
    en: { location: "Ann Arbor, MI", deadline: "Nov 1, 2026", decision: "Rolling from late January 2027", tuition: "$58,510 (out-of-state)", notes: "Decisions are released in rolling batches — applying early only means earlier notification." },
    history: [ { year: 2023, earlyRate: 30.8, regularRate: 16.5 }, { year: 2024, earlyRate: 28.5, regularRate: 15.8 }, { year: 2025, earlyRate: 26.1, regularRate: 15.0 } ] },
  { rank: 24, name: "南加州大学", nameEn: "University of Southern California", location: "加利福尼亚州 · 洛杉矶", type: "ED", typeLabel: "新增绑定 ED + 非限制 EA", binding: true, deadline: "2026年11月1日", decision: "2026年12月中旬（ED）/ 2027年1月中下旬（EA）", earlyRate: 18.8, regularRate: 9.7, overallRate: 9.8, tuition: "$69,904", notes: "【2026-27申请季新政策】USC 首次为 Fall 2027 入学申请者开放绑定 ED（截止11月1日，12月中旬放榜，戏剧/音乐/舞蹈学院不参与），与原有非限制性 EA 并行；ED 尚无历史录取率数据，早申录取率为 EA 口径",
    en: { location: "Los Angeles, CA", deadline: "Nov 1, 2026", decision: "Mid-December 2026 (ED) / Mid-to-late January 2027 (EA)", tuition: "$69,904", notes: "[New for 2026-27] USC now offers binding ED for Fall 2027 applicants (deadline Nov 1, decisions mid-December; the Kaufman School of Dance, Thornton School of Music, and School of Dramatic Arts are excluded), alongside its existing non-restrictive EA. ED has no acceptance-rate history yet — the early rate shown reflects EA." },
    history: [ { year: 2023, earlyRate: 22.2, regularRate: 10.7 }, { year: 2024, earlyRate: 20.5, regularRate: 10.2 }, { year: 2025, earlyRate: 18.8, regularRate: 9.7 } ] },
  { rank: 25, name: "弗吉尼亚大学", nameEn: "University of Virginia", location: "弗吉尼亚州 · 夏洛茨维尔", type: "ED", typeLabel: "绑定 ED + 非限制 EA", binding: true, deadline: "2026年11月1日", decision: "2026年12月15日前（ED）/ 2027年2月15日前（EA）", earlyRate: 21.0, regularRate: 15.6, overallRate: 16.6, tuition: "$58,864（州外）", notes: "同时提供绑定 ED 与非限制性 EA 两种早申，不设 ED2",
    en: { location: "Charlottesville, VA", deadline: "Nov 1, 2026", decision: "By Dec 15, 2026 (ED) / By Feb 15, 2027 (EA)", tuition: "$58,864 (out-of-state)", notes: "Offers both binding ED and non-restrictive EA — no ED2." },
    history: [ { year: 2023, earlyRate: 24.8, regularRate: 17.2 }, { year: 2024, earlyRate: 22.9, regularRate: 16.4 }, { year: 2025, earlyRate: 21.0, regularRate: 15.6 } ] },
  { rank: 26, name: "卡内基梅隆大学", nameEn: "Carnegie Mellon University", location: "宾夕法尼亚州 · 匹兹堡", type: "ED", typeLabel: "绑定早申 ED", binding: true, deadline: "2026年11月3日", decision: "2026年12月中旬", earlyRate: 20.0, regularRate: 10.9, overallRate: 11.3, tuition: "$63,829", notes: "2026-27申请季（Fall 2027入学）截止日顺延至11月3日（11月1日为周日）；部分学院（如计算机学院）早申竞争尤为激烈",
    en: { location: "Pittsburgh, PA", deadline: "Nov 3, 2026", decision: "Mid-December 2026", tuition: "$63,829", notes: "For the 2026-27 cycle (Fall 2027 entry), the deadline is pushed to Nov 3 since Nov 1 falls on a Sunday. Some colleges (e.g. School of Computer Science) are especially competitive early." },
    history: [ { year: 2023, earlyRate: 23.6, regularRate: 12.0 }, { year: 2024, earlyRate: 21.8, regularRate: 11.4 }, { year: 2025, earlyRate: 20.0, regularRate: 10.9 } ] },
  { rank: 27, name: "北卡罗来纳大学教堂山分校", nameEn: "University of North Carolina at Chapel Hill", location: "北卡罗来纳州 · 教堂山", type: "EA", typeLabel: "非限制性早申 EA", binding: false, deadline: "2026年10月15日", decision: "州内2026年12月中旬 / 州外2027年2月上旬", earlyRate: 30.5, regularRate: 14.0, overallRate: 16.8, tuition: "$39,384（州外）", notes: "州内、州外录取率与放榜时间差异较大",
    en: { location: "Chapel Hill, NC", deadline: "Oct 15, 2026", decision: "In-state mid-December 2026 / Out-of-state early February 2027", tuition: "$39,384 (out-of-state)", notes: "In-state and out-of-state acceptance rates and notification timing differ significantly." },
    history: [ { year: 2023, earlyRate: 36.0, regularRate: 15.4 }, { year: 2024, earlyRate: 33.2, regularRate: 14.7 }, { year: 2025, earlyRate: 30.5, regularRate: 14.0 } ] },
  { rank: 28, name: "纽约大学", nameEn: "New York University", location: "纽约州 · 纽约", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月1日 / 2027年1月1日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 22.0, regularRate: 8.0, overallRate: 8.0, tuition: "$63,568", notes: "提供 ED1 与 ED2 两轮绑定申请",
    en: { location: "New York, NY", deadline: "Nov 1, 2026 / Jan 1, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$63,568", notes: "Offers both ED1 and ED2 binding rounds." },
    history: [ { year: 2023, earlyRate: 26.0, regularRate: 8.8 }, { year: 2024, earlyRate: 24.0, regularRate: 8.4 }, { year: 2025, earlyRate: 22.0, regularRate: 8.0 } ] },
  { rank: 29, name: "塔夫茨大学", nameEn: "Tufts University", location: "马萨诸塞州 · 梅德福", type: "ED2", typeLabel: "绑定早申 ED1/ED2", binding: true, deadline: "2026年11月2日 / 2027年1月4日", decision: "2026年12月中旬 / 2027年2月中旬", earlyRate: 24.0, regularRate: 8.5, overallRate: 9.5, tuition: "$67,912", notes: "2026-27申请季（Fall 2027入学）ED1截止日为11月2日；提供 ED1 与 ED2 两轮绑定申请",
    en: { location: "Medford, MA", deadline: "Nov 2, 2026 / Jan 4, 2027", decision: "Mid-December 2026 / Mid-February 2027", tuition: "$67,912", notes: "For the 2026-27 cycle (Fall 2027 entry), the ED1 deadline is Nov 2. Offers both ED1 and ED2 binding rounds." },
    history: [ { year: 2023, earlyRate: 28.3, regularRate: 9.4 }, { year: 2024, earlyRate: 26.2, regularRate: 8.9 }, { year: 2025, earlyRate: 24.0, regularRate: 8.5 } ] },
  { rank: 30, name: "波士顿学院", nameEn: "Boston College", location: "马萨诸塞州 · 切斯特纳特希尔", type: "EA", typeLabel: "非限制性早申 EA", binding: false, deadline: "2026年11月1日", decision: "2027年1月中旬", earlyRate: 25.0, regularRate: 15.0, overallRate: 16.0, tuition: "$65,464", notes: "非限制性 EA，也可选择绑定 ED1/ED2",
    en: { location: "Chestnut Hill, MA", deadline: "Nov 1, 2026", decision: "Mid-January 2027", tuition: "$65,464", notes: "Non-restrictive EA — binding ED1/ED2 is also available." },
    history: [ { year: 2023, earlyRate: 29.5, regularRate: 16.5 }, { year: 2024, earlyRate: 27.3, regularRate: 15.8 }, { year: 2025, earlyRate: 25.0, regularRate: 15.0 } ] },
];

// 早申类型的展示样式配置（中英双语）
const TYPE_META = {
  ED:   { label: { zh: "ED 绑定早申",     en: "Binding ED" },        className: "type-ed"   },
  ED2:  { label: { zh: "ED1/ED2 绑定",   en: "Binding ED1/ED2" },   className: "type-ed"   },
  EA:   { label: { zh: "EA 非限制早申",   en: "Non-Restrictive EA" }, className: "type-ea"   },
  REA:  { label: { zh: "REA 限制性早申", en: "Restrictive REA" },    className: "type-rea"  },
  NONE: { label: { zh: "无早申计划",      en: "No Early Program" },   className: "type-none" },
};
