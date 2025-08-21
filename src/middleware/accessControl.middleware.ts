// src/middlewares/access-control.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { getListPermissionById } from '../service/permission.service';
// import roleService from '../service/role.service';
import { ApiResponse } from '../model/base/response.dto';

export function accessControlMiddleware(router: string, action: string) {
    
  return async (req: Request, res: Response, next: NextFunction) => {

    const apiRes: ApiResponse = {
      status: 403,
      message: 'Access denied.',
      error: 'Forbidden',
      isBusinessError: true,
      errorDetail: null,
      resultApi: null,
    };

    next();

    // try {
    //   const authHeader = req.headers.authorization;
    //   if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     apiRes.message = 'Missing or invalid token.';
    //     return res.status(403).json(apiRes);
    //   }

    //   const token = authHeader.split(' ')[1];
    //   const decoded: any = jwt.verify(token, process.env.SECRET_KEY || '');

    // //   const role = await roleService.getRoleById(decoded.role);
    // //   const listPermissions = await getListPermissionById(decoded.role);
    //  const role:any = {};
    //   const listPermissions:any = {};
    //   const hasPermission =
    //     listPermissions.role === role.roleName &&
    //     (
    //       listPermissions.listPermistions.find(
    //         (perm: any) => perm.router === router && perm.actions.includes(action)
    //       ) ||
    //       listPermissions.listPermistions.find(
    //         (perm: any) => perm.router === 'cms-admin' && perm.actions.includes('system')
    //       )
    //     );

    //   if (!hasPermission) {
    //     apiRes.message = 'You do not have permission to perform this action.';
    //     return res.status(403).json(apiRes);
    //   }

    //   (req as any)['x-userInfo'] = decoded;
    //   (req as any)['x-role'] = role;
    //   next();
    // } catch (error: any) {
    //   apiRes.message = 'Invalid or expired token.';
    //   apiRes.errorDetail = error.message || 'Unauthorized';
    //   return res.status(403).json(apiRes);
    // }
  };
}
