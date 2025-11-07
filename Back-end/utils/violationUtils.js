export const countViolationsInLast7Days = (dates) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  return dates.filter(dateStr => {
    const date = new Date(dateStr);
    return date >= sevenDaysAgo && date <= now;
  }).length;
};

export const banUser = (email) => {
  const banList = JSON.parse(localStorage.getItem('bannedUsers')) || {};
  banList[email] = { banned: true, date: new Date().toISOString() };
  localStorage.setItem('bannedUsers', JSON.stringify(banList));
};
