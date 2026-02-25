import { CuponForm } from "../components/form";

export default function CreateCuponPage() {
  return <CuponForm initialData={{ code: "", type: "PERCENTAGE", target: "GLOBAL", value: 0, active: true }} />;
}
