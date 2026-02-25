export type LoginActionState = {
  ok: boolean;
  message: string;
  redirect?: string;
};

export const initialLoginState: LoginActionState = {
  ok: false,
  message: "",
};
