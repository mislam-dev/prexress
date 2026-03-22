import { UserService } from "@/modules/user/user.service";
import { Controller, GET, POST, UseDTO } from "@prexress/core";
import type { NextFunction, Request, Response } from "@prexress/frm";
import { autoInjectable } from "tsyringe";
import { CreateUserDto } from "./dtos/create-user.dto";

@autoInjectable()
@Controller("/user")
export class UserController {
  constructor(readonly userService: UserService) {}

  @GET("/")
  async find(_req: Request, res: Response, next: NextFunction) {
    const data = await this.userService.findAll();
    return res.status(200).json(data);
  }

  @UseDTO(CreateUserDto)
  @POST("/")
  async create(req: Request<any, any, CreateUserDto>, res: Response) {
    // const newData = await this.userService.create(req.body);
    return res.status(200).json(req.body);
  }
}

export const UserControllerToken = Symbol("UserControllerToken");
