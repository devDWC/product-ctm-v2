const failedLoginAttempts = new Map<string, number>();

export const trackLoginAttempts = (req: any, res: any, next: any) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  req.loginAttemptInfo = {
    ip,
    count: failedLoginAttempts.get(ip) || 0,
  };
  next();
};

export const increaseFailedAttempt = (ip: string) => {
  const current = failedLoginAttempts.get(ip) || 0;
  failedLoginAttempts.set(ip, current + 1);
};

export const resetFailedAttempt = (ip: string) => {
  failedLoginAttempts.delete(ip);
};
