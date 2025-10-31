import logger from "../config/logger.config.js";

/**
 * @description Hàm delay ngẫu nhiên giữa hai khoảng thời gian
 * * Nếu timeMin và timeMax bằng nhau, thì sẽ delay đúng thời gian đó.
 * @param {number} timeMin - Thời gian tối thiểu
 * @param {number} timeMax - Thời gian tối đa
 * @returns {Promise<void>} - Không có trả về, chỉ thực hiện delay
 */
export const delayCustom = async (
  timeMin: number,
  timeMax: number
): Promise<void> => {
  const time =
    timeMin === timeMax
      ? timeMax
      : Math.floor(Math.random() * (timeMax - timeMin + 1) + timeMin);
    // logger.info(`Delay ${time} ms`);
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
