/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "@prexress/frm";
import { plainToInstance } from "class-transformer";
import { validate as classValidate } from "class-validator";
import { ValidationException } from "../errors";

export const validate = async (dtoClass: any, data: any) => {
  if (!data || typeof data !== "object") {
    return {
      errors: [
        {
          property: "body",
          constraints: ["Body must be an object and not empty"],
        },
      ],
      output: null,
    };
  }

  const output = plainToInstance(dtoClass, data);
  const errors = await classValidate(output, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints ? Object.values(error.constraints) : [],
    }));
    return {
      errors: errorMessages,
      output: null,
    };
  }

  return {
    errors: [],
    output,
  };
};

export const validateDtoHandler = (dtoClass: any) => {
  return async (req: Request, res: Response, next?: NextFunction) => {
    const { errors, output } = await validate(dtoClass, req.body);
    if (errors.length > 0) throw new ValidationException(errors);
    req.body = output;
    return next?.();
  };
};
