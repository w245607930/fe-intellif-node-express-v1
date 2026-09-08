export function success(data = null, message = 'success') {
  return { code: 0, message, data };
}

export function failure({ code, message, details, requestId }) {
  return {
    code,
    message,
    data: null,
    ...(details === undefined ? {} : { details }),
    ...(requestId === undefined ? {} : { requestId }),
  };
}

export function paginated({ list, total, page, pageSize }, message = 'success') {
  return success({ list, total, page, pageSize }, message);
}
