import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { getCheckoutReadiness } from "./checkout-readiness";

@Controller("checkout")
export class CheckoutController {
  @Get("status")
  status() {
    return getCheckoutReadiness();
  }

  @Post("guest-cod")
  @HttpCode(HttpStatus.SERVICE_UNAVAILABLE)
  submitGuestCod() {
    throw new ServiceUnavailableException({
      code: "SHOP_CHECKOUT_DISABLED",
      ...getCheckoutReadiness(),
      message: "Guest COD checkout is paused until Shop order operations and inventory release are verified.",
    });
  }
}
