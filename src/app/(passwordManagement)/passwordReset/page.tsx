// Página para mostrar el formulario de restablecimiento de contraseña
import { Krona_One } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import PasswordResetForm from "./form";

// Carga la fuente Krona_One con peso 400
const krona = Krona_One({ weight: "400", subsets: ["latin"] });

// Componente que envuelve el formulario de restablecimiento de contraseña
const PasswordResetPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <PasswordResetForm />
    </div>
  );
};

export default PasswordResetPage;