export const priceDisplay = (price) => {
  const _p = Number(price);
  if (_p >= 1) {
    return parseFloat(parseFloat(_p).toFixed(2)).toLocaleString(
        "id-ID",
        {
          useGrouping: true,
        }
      );
  }
  return _p;
};
