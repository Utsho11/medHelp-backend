const sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success ?? true,
    statusCode: data.statusCode,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data !== undefined ? data.data : null,
  });
};

export default sendResponse;
