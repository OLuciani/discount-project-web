"use client";
import React, { useContext, useState, useEffect } from "react";
import { Context } from "@/context/Context";
import { AiOutlineBell } from "react-icons/ai";
import { AiOutlineTag } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { FaChartLine } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import { getUserNotifications } from "@/api/userService";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import TokenExpiredModal from "@/components/tokenExpiredModal/TokenExpiredModal";
import Cookies from "js-cookie";


interface SidebarBusinessAdminDashboardProps {
  setSection: (section: string) => void;
  section: string;
  setReduceHeight: (reduceHeight: boolean) => void; //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.
}

const SidebarBusinessAdminDashboard: React.FC<SidebarBusinessAdminDashboardProps> = ({
  setSection,
  section,
  setReduceHeight,
}) => {
  const { businessName, isLoggedIn, userRole, userSubRole, setUserSubRole, setUserToken, setUserRole, setUserId, setUserName, setBusinessName, setBusinessId, setBusinessType, setSelectedOption } =
    useContext(Context);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [businessDirectorRole, setBusinessDirectorRole] = useState<
    string | undefined
  >("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Estado para manejar el modal TokenExpiredModal.tsx


  //const roleBusinessDirector = process.env.NEXT_PUBLIC_ROLE_BUSINESS_DIRECTOR;
  
  //Adjudico el rol a la constante directamente y no con una variables de entorno, ya que al utilizar un proxy en next.config.mjs para solucionar el problema con las cookies de terceros en algunos dispositivos que tienen por defecto navegadores como por ejemplo safari que no acepta cookies de terceros ese proxy crea conflicto con las variables de entorno en producción de vercel. Lo hago porque los valores que se adjudican no son datos sensibles, ya que los verdaderos roles son secrets que van en las cookies y se utilizan solo en el backend para autenticar roles en las rutas de las solicitudes.
  const roleBusinessDirector = "businessDirector";

  const fetchUnreadNotifications = async () => {
    try {
      const notificationsData = await getUserNotifications();

      //Si el token expiró va a mostrar un modal informando al usuario
      if (notificationsData === "TOKEN_EXPIRED") {
        setIsModalOpen(true); // Muestra el modal TokenExpiredModal.tsx si el token es inválido y redirecciona a login
        return; // Detiene la ejecución para evitar errores con response
      }

      const unreadNotifications = notificationsData.filter(
        (notification: any) => !notification.read
      );
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error al obtener las notificaciones no leídas:", error);
    }
  };

  const handleNotificationClick = async () => {
    setTimeout(() => {
      fetchUnreadNotifications();
    }, 1000);
    setSection("notificaciones");
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnreadNotifications();
  }, [isLoggedIn, setSection]);

  //A este useEffect lo creé para cuando se refresca la vista de este componente
  useEffect(() => {
    console.log("valor de userSubRole: ", userSubRole);
    setBusinessDirectorRole(roleBusinessDirector);

    const cookieUserSubRole = Cookies.get("userSubRole") || "";
    setUserSubRole(cookieUserSubRole);

    const storedUserToken = Cookies.get("userToken") || "";
    setUserToken(storedUserToken);

    const cookieUserRole = Cookies.get("userRole") || "";
    setUserRole(cookieUserRole);

    const cookieUserId = Cookies.get("userId") || "";
    setUserId(cookieUserId);

    const cookieUserName = Cookies.get("userName") || "";
    setUserName(cookieUserName);

    const cookieBusinessName = Cookies.get("businessName") || "";
    setBusinessName(cookieBusinessName);

    const cookieBusinessId = Cookies.get("businessId") || "";
    setBusinessId(cookieBusinessId);

    const cookieBusinessType = Cookies.get("businessType") || "";
    setBusinessType(cookieBusinessType);

    setSelectedOption("Mi cuenta");
  }, [
    setUserToken,
    setUserRole,
    setUserId,
    setUserName,
    setBusinessName,
    setBusinessId,
    setBusinessType,
    //setDiscountId,
    setSelectedOption,
  ]);

  return (
    <div className="">
      <TokenExpiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div
        className={`w-full flex justify-between items-center pl-4 fixed bg-white top-[57] border-b-2 lg:border-b-0 z-10`}
      >
        <span className="lg:hidden text-2xl font-semibold">{businessName}</span>
        <button
          className="lg:hidden py-4 pr-4"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
            const mainElement = document.querySelector("main");
            if (mainElement) {
              mainElement.scrollTo(0, 0);
            }
            if (isSidebarOpen) {
              setReduceHeight(true);
            } else {
              setReduceHeight(false);
            }
          }}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          {isSidebarOpen ? (
            <AiOutlineClose size={25} aria-hidden="true" />
          ) : (
            <AiOutlineMenu size={25} aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        className={`bg-[#FFCF91] text-[#2C2C2C] font-bold w-full lg:w-96 lg:h-screen 
      ${
        isSidebarOpen ? "block" : "hidden lg:block"
      } h-auto lg:sticky mb-3 lg:mb-0 lg:top-0 
      flex flex-col overflow-y-auto`}
      >
        <h1 className="text-2xl font-bold text-[#2C2C2C] text-center px-2 pt-4">
          {businessName}
        </h1>

        <nav className="flex-grow p-4">
          {/* Título para acciones en la cuenta */}
          <h2 className="text-lg text-center font-bold mt-6">ESTADISTICAS:</h2>

          <div className="button-group flex flex-col gap-1">
            {" "}
            {/* Usar una clase común para ambas secciones */}
            <button
              onClick={() => {
                setSection("overview");
                setIsSidebarOpen(false);
                setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                // Restablece el scroll del contenedor principal al inicio
                const mainElement = document.querySelector("main");
                if (mainElement) {
                  mainElement.scrollTo(0, 0);
                }
              }}
              className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                section === "overview"
                  ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                  : "text-[#2C2C2C]"
              }`}
            >
              <FiFileText className="inline mr-2" />
              Resumen
            </button>

            <button
              onClick={() => {
                setSection("activeDiscountsOverview");
                setIsSidebarOpen(false);
                setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                // Aquí debakp establezco el scroll del contenedor principal al inicio
                const mainElement = document.querySelector("main");
                if (mainElement) {
                  mainElement.scrollTo(0, 0);
                }
              }}
              className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                section === "activeDiscountsOverview"
                  ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                  : "text-[#2C2C2C]"
              }`}
            >
              <AiOutlineTag className="inline mr-2" />
              {`Descuentos activos (ver actividad)`}
            </button>
            
            <button
              onClick={() => {
                setSection("sales");
                setIsSidebarOpen(false);
                setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                // Restablece el scroll del contenedor principal al inicio
                const mainElement = document.querySelector("main");
                if (mainElement) {
                  mainElement.scrollTo(0, 0);
                }
              }}
              className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                section === "sales"
                  ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                  : "text-[#2C2C2C]"
              }`}
            >
              <FaChartLine className="inline mr-2" />
              {`Total de Ventas (descuentos utilizados)`}
            </button>

            <button
              onClick={() => {
                setSection("notificaciones");
                handleNotificationClick();
                setIsSidebarOpen(false);
                setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                // Restablece el scroll del contenedor principal al inicio
                const mainElement = document.querySelector("main");
                if (mainElement) {
                  mainElement.scrollTo(0, 0);
                }
              }}
              className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white relative ${
                section === "notificaciones"
                  ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                  : "text-[#2C2C2C]"
              }`}
            >
              <AiOutlineBell className="inline mr-2" />
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-5 lg:absolute lg:top-[30%] lg:right-3 bg-red-600 text-white text-xs rounded-full px-2">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Título para acciones en la cuenta */}
          <h2 className="text-lg text-center font-bold mt-6">
            ACCIONES EN MI CUENTA:
          </h2>

          {/* Mismo grupo de botones */}
          <div className="button-group flex flex-col gap-1  scrollbar-hidden">
            <button
              onClick={() => {
                setSection("discountCreate");
                setIsSidebarOpen(false);
                setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                // Restablece el scroll del contenedor principal al inicio
                const mainElement = document.querySelector("main");
                if (mainElement) {
                  mainElement.scrollTo(0, 0);
                }
              }}
              className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                section === "discountCreate"
                  ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                  : "text-[#2C2C2C]"
              }`}
            >
              Crear un descuento
            </button>

            <button
              onClick={() => {
                setSection("activeDiscountsGallery");
                setIsSidebarOpen(false);
                setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                // Restablece el scroll del contenedor principal al inicio
                const mainElement = document.querySelector("main");
                if (mainElement) {
                  mainElement.scrollTo(0, 0);
                }
              }}
              className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                section === "activeDiscountsGallery"
                  ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                  : "text-[#2C2C2C]"
              }`}
            >
              Ver y gestionar mis descuentos activos
            </button>

            {userSubRole !== "visit_user" && (
              <button
                onClick={() => {
                  setSection("editAccount");
                  setIsSidebarOpen(false);
                  setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                  // Restablece el scroll del contenedor principal al inicio
                  const mainElement = document.querySelector("main");
                  if (mainElement) {
                    mainElement.scrollTo(0, 0);
                  }
                }}
                className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                  section === "editAccount"
                    ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                    : "text-[#2C2C2C]"
                }`}
              >
                Editar datos de mi cuenta
              </button>
            )}

            {businessDirectorRole && userRole === businessDirectorRole && (
              <>
                <button
                  onClick={() => {
                    setSection("invitationExtraBusinessAdmin");
                    setIsSidebarOpen(false);
                    setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                    // Restablece el scroll del contenedor principal al inicio
                    const mainElement = document.querySelector("main");
                    if (mainElement) {
                      mainElement.scrollTo(0, 0);
                    }
                  }}
                  className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                    section === "invitationExtraBusinessAdmin"
                      ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                      : "text-[#2C2C2C]"
                  }`}
                >
                  Crear usuario administrador p/mi cuenta
                </button>

                <button
                  onClick={() => {
                    setSection("invitationBusinessEmployee");
                    setIsSidebarOpen(false);
                    setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                    // Restablece el scroll del contenedor principal al inicio
                    const mainElement = document.querySelector("main");
                    if (mainElement) {
                      mainElement.scrollTo(0, 0);
                    }
                  }}
                  className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                    section === "invitationBusinessEmployee"
                      ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                      : "text-[#2C2C2C]"
                  }`}
                >
                  Crear usuario empleado p/mi cuenta
                </button>

                <button
                  onClick={() => {
                    setSection("asociatedBusinessUsers");
                    setIsSidebarOpen(false);
                    setReduceHeight(true); //reduce el el espacio entre el Sidebar y renderSection en el dashboard cuando la pantalla es pequeña.

                    // Restablece el scroll del contenedor principal al inicio
                    const mainElement = document.querySelector("main");
                    if (mainElement) {
                      mainElement.scrollTo(0, 0);
                    }
                  }}
                  className={`block w-full text-left p-2 rounded transition-colors duration-300 ease-in-out hover:bg-[#FD7B03] hover:text-white ${
                    section === "activeBusinessUsers"
                      ? "border-[2px] border-[#2C2C2C] hover:border-[#FD7B03]"
                      : "text-[#2C2C2C]"
                  }`}
                >
                  Usuarios asociados a mi cuenta
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SidebarBusinessAdminDashboard;
