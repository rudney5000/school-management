import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { respond } from '@/shared/utils/respond';
import { AuthService } from './auth.service';
import type {LoginDto, RefreshDto, RegisterDto} from './auth.schema';

export class AuthController {
  private readonly service = new AuthService();

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tokens = await this.service.register(req.body as RegisterDto);
    respond(res, tokens, 201);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tokens = await this.service.login(req.body as LoginDto);
    respond(res, tokens);
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshDto;
    const tokens = await this.service.refresh(refreshToken);
    respond(res, tokens);
  });

  me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.me(req.user!.id);
    respond(res, data);
  });

  logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    // stateless JWT — le client supprime le token
    // plus tard : blacklist Redis
    res.status(204).send();
  });
}