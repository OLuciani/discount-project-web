"use client"
import { Context } from "@/context/Context"; // Importa tu contexto aquí
import React, { useContext } from "react";
import EditAccountForm from "@/components/dashboardBusinessAdminComponents/editAccount/EditAccountForm"; // 

interface EditAccountProps {
    setSection: (section: string) => void;
    section: string;
  }


const EditAccount: React.FC<EditAccountProps> = ({ setSection, section }) => {
  const { userId, businessId, setSelectedOption } = useContext(Context);

  return (
    <div className="bg-white border-2 shadow-lg rounded-lg p-2 custom-w-450:p-4 lg:py-4 h-full relative">
        <div className="w-full flex flex-col justify-center items-center">
          <div className="w-full sm:w-[450px] pb-2 rounded-t-[40px] max-md:top-0 max-md:rounded-none max-md:h-auto">
              <h1 className="my-5 text-2xl custom-w-450:text-3xl text-[black] font-semibold text-center">Editar cuenta</h1>
              <div className="items-center justify-center pb-[3%]">
                  <EditAccountForm businessId={businessId} setSection={setSection} section={section} />
              </div>
          </div>
        </div>
    </div>
  );
}

export default EditAccount;