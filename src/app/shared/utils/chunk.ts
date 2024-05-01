export const chunk = <T>(array: T[], size: number): T[][] => array.reduce<T[][]>((acc, curr, index) => {
  if (index % size === 0) acc.push([curr]);
  else acc[acc.length - 1].push(curr);
  return acc;
}, []);
