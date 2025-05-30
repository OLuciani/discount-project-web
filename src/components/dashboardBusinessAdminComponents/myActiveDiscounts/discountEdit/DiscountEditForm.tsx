"use client";
import React, { useState, useEffect, useContext } from "react";
import Input from "@/components/InputAuth/Input";
import { editDiscount, discountsList } from "@/api/discountService";
import { Discount } from "@/types/discountTypes";
//import { editDiscount, Discount, discountsList, DiscountsList } from "@/services/apiCall";
import { useRouter } from "next/navigation";
import { useFormik, FormikProps } from "formik";
import * as Yup from "yup";
import TextareaAutosize from "react-textarea-autosize";
import axios, { AxiosError } from "axios";
import { Context } from "@/context/Context";
import Cookies from "js-cookie";
import Button from "@/components/button/Button";
import TokenExpiredModal from "@/components/tokenExpiredModal/TokenExpiredModal";
import { isAfter } from "date-fns";
import MessageModal from "@/components/messageModal/MessageModal";

interface DiscountEditFormProps {
  //setShowDiscountEdit: (showDiscountEdit: boolean) => void;
  setShowDiscountActionPage: (showDiscountActionPage: boolean) => void;
}

interface ErrorResponse {
  error: string;
}

const FormEditDiscount: React.FC<DiscountEditFormProps> = ({
  setShowDiscountActionPage,
}) => {
  const {
    discountId,
    discountRecovered,
    isLoggedIn,
    setDiscountId,
    setUserRole,
    setUserName,
    setBusinessName,
    setBusinessType,
    setSelectedOption,
    setDiscountsArrayList,
  } = useContext(Context);
  const [error, setError] = useState<string | undefined>(undefined);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [userToken, setUserToken] = useState<string>("");
  const navigation = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isOpenMessageModal, setIsOpenMessageModal] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [messageTitle, setMessageTitle] = useState<string>("");
  const [messageRouterRedirection, setMessageRouterRedirection] =
    useState<string>("");
  const [selectedNavBarOption, setSelectedNavBarOption] = useState<string>("");

  const [isPermanent, setIsPermanent] = useState<boolean>(true);

  useEffect(() => {
    if (isLoggedIn) {
      const storedUserToken = Cookies.get("userToken") || "";
      setUserToken(storedUserToken);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (discountRecovered !== null) {
      console.log("Setting discount from discountRecovered", discountRecovered);
      setDiscount(discountRecovered);

      if (discountRecovered.validityPeriod === null || discountRecovered.validityPeriod === 0) {
        setIsPermanent(true);
      } else {
        setIsPermanent(false)
      }

      console.log(
        "******valor que llega de validityPeriod******: ",
        discountRecovered.validityPeriod
      );

      const cookieDiscountId = Cookies.get("discountId") || "";
      setDiscountId(cookieDiscountId);

      // Guardar discountRecovered en una cookie
      Cookies.set("discountRecovered", JSON.stringify(discountRecovered));
    }
  }, [discountRecovered, setDiscountId]);

  //A este useEffect lo creé para cuando se refresca la vista de este componente
  useEffect(() => {
    const savedDiscount = Cookies.get("discountRecovered") || "";
    if (savedDiscount) {
      const parsedDiscount = JSON.parse(savedDiscount);
      setDiscount(parsedDiscount);
    }

    const storedUserToken = Cookies.get("userToken") || "";
    setUserToken(storedUserToken);

    const cookieUserRole = Cookies.get("userRole") || "";
    setUserRole(cookieUserRole);

    const cookieUserName = Cookies.get("userName") || "";
    setUserName(cookieUserName);

    const cookieBusinessName = Cookies.get("businessName") || "";
    setBusinessName(cookieBusinessName);

    const cookieBusinessType = Cookies.get("businessType") || "";
    setBusinessType(cookieBusinessType);

    const cookieDiscountId = Cookies.get("discountId") || "";
    setDiscountId(cookieDiscountId);

    setSelectedOption("Mi cuenta");
  }, [
    setUserToken,
    setUserRole,
    //setUserId,
    setUserName,
    setBusinessName,
    //setBusinessId,
    setBusinessType,
    setDiscountId,
    setSelectedOption,
  ]);

  const validationSchema = Yup.object({
    businessName: Yup.string()
      .min(3, "El nombre del negocio debe tener al menos 3 caracteres")
      .required("El nombre del negocio es requerido"),
    title: Yup.string()
      .min(3, "El título debe tener al menos 3 caracteres")
      .required("El título es requerido"),
    description: Yup.string()
      .min(3, "La descripción debe tener al menos 3 caracteres")
      .max(130, "La descripción no puede tener más de 130 caracteres")
      .required("La descripción es requerida"),
    normalPrice: Yup.string()
      .min(1, "El precio del descuento debe ser al menos 1")
      .required("El precio del descuento es requerido"),
    discountAmount: Yup.string()
      .min(1, "El porcentaje de descuento debe ser al menos 1")
      .required("El porcentaje de descuento es requerido"),
    imageURL: Yup.mixed().nullable(),
    validityPeriod: Yup.number().nullable().min(0, ""), // Es opcional, y en caso de implementar a duración  lo mínimo es 1 día
  });

  const formik = useFormik({
    initialValues: {
      title: discount?.title || "",
      description: discount?.description || "",
      normalPrice: discount?.normalPrice || "",
      discountAmount: discount?.discountAmount || "",
      imageURL: null as File | Blob | null,
      businessName: discount?.businessName || "",
      //businessId: discount?.businessId || "",
      businessType: discount?.businessType || "",
      isActive: discount?.isActive ?? true,
      //validityPeriod: discount?.validityPeriod || null as number | null,
      validityPeriod: discount?.validityPeriod ?? 0, // Usamos '0' como valor predeterminado si no existe 'validityPeriod'
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Form values before submission:", values);
      setError(undefined);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("normalPrice", values.normalPrice);
      formData.append("discountAmount", values.discountAmount);
      formData.append("businessName", values.businessName);
      //formData.append("businessId", values.businessId);
      formData.append("isActive", String(values.isActive));

      // Solo agregar validityPeriod si el usuario ingresó un nuevo valor y diferente al original.
      /* if (
        values.validityPeriod !== null && // El usuario escribió algo
        values.validityPeriod !== discount?.validityPeriod // Es diferente al valor original
      ) {
        formData.append("validityPeriod", values.validityPeriod.toString());
      } */
      formData.append("validityPeriod", values.validityPeriod.toString());

      if (values.imageURL instanceof File || values.imageURL instanceof Blob) {
        formData.append("imageURL", values.imageURL);
      } else if (discount && discount.imageURL) {
        formData.append("imageURL", discount.imageURL as Blob);
      }

      try {
        const response = await editDiscount(formData, discountId);

        //Si el token expiró va a mostrar un modal informando al usuario
        if (response === "TOKEN_EXPIRED") {
          setIsModalOpen(true); // Muestra el modal TokenExpiredModal.tsx si el token es inválido y redirecciona a login
          return; // Detiene la ejecución para evitar errores con response
        }

        if (typeof response === "object" && response !== null) {
          setError("");
          const fetchDiscounts = async () => {
            try {
              if (userToken) {
                //console.log("Valor de userToken en fetchDiscounts: ", userToken);
                const response = await discountsList();

                //Si el token expiró va a mostrar un modal informando al usuario
                if (response === "TOKEN_EXPIRED") {
                  setIsModalOpen(true); // Muestra el modal TokenExpiredModal.tsx si el token es inválido y redirecciona a login
                  return; // Detiene la ejecución para evitar errores con response
                }

                if (typeof response !== "string") {
                  // Filtramos los descuentos expirados antes de establecer el estado
                  const now = new Date();
                  const validDiscounts = response.filter(
                    (discount) =>
                      !discount.validityPeriod ||
                      !isAfter(
                        now,
                        new Date(discount.startDateTime).setDate(
                          new Date(discount.startDateTime).getDate() +
                            discount.validityPeriod
                        )
                      )
                  );
                  setDiscountsArrayList(validDiscounts);
                } else {
                  console.error("Error al obtener descuentos: ", response);
                }
              } else {
                console.error(
                  "No se puede obtener descuentos, falta businessId o userToken"
                );
              }
            } catch (error) {
              if (axios.isAxiosError(error) && error.response) {
                const axiosError = error as AxiosError<ErrorResponse>;
                const errorMessage =
                  axiosError.response?.data.error ||
                  "Error en la solicitud de actualización";
                console.error("Error al obtener descuentos: ", errorMessage);
              } else {
                console.error(
                  "Error desconocido al obtener descuentos: ",
                  error
                );
              }
            }
          };

          fetchDiscounts();

          const title: string = "El descuento se ha editado exitosamente";
          setMessageTitle(title);

          const text: string = `Serás redirigido al listado de descuentos para verificar la modificación.`;
          setMessageText(text);

          const route: string = "/dashboardBusinessAdmin";
          setMessageRouterRedirection(route);

          setIsOpenMessageModal(true);

          const navBarOption: string = "Mi cuenta";
          setSelectedNavBarOption(navBarOption);

          setTimeout(() => {
            setShowDiscountActionPage(false);
            const mainElement = document.querySelector("main");
            if (mainElement) {
              mainElement.scrollTo(0, 0);
            }
          }, 10000);
        } else {
          setError(response);
        }
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          handleAxiosError(err);
        } else {
          console.error("Error inesperado:", err);
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setIsLoading(false); // Esto se ejecuta sin importar si la solicitud tuvo éxito o falló
      }
    },
  });

  const handleAxiosError = (error: AxiosError<any>) => {
    if (error.response) {
      console.error(
        "Error en la solicitud de actualización:",
        error.response.data
      );
      setError(
        error.response.data.error || "Error en la solicitud de actualización"
      );
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor:", error.request);
      setError(
        "No se recibió respuesta del servidor. Intente de nuevo más tarde."
      );
    } else {
      console.error("Error al realizar la solicitud:", error.message);
      setError("Ocurrió un error al realizar la solicitud.");
    }
  };

  useEffect(() => {
    if (discount !== null) {
      console.log("Synchronizing formik values with discount state", discount);

      formik.setValues({
        title: discount.title || "",
        description: discount.description || "",
        normalPrice: discount.normalPrice || "",
        discountAmount: discount.discountAmount || "",
        businessName: discount.businessName || "",
        //businessId: discount.businessId || "",
        businessType: discount.businessType || "",
        isActive: discount.isActive ?? true,
        imageURL: null,
        //validityPeriod: discount.validityPeriod || null as number | null,
        validityPeriod: discount.validityPeriod ?? 0, // ⚡ Fuerza a 0 en caso de null/undefined
      });
    }
  }, [discount]);

  return (
    <>
      <TokenExpiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="w-sreen flex justify-center">
        {/* Modal para mostrar mensajes al usuario */}
        <MessageModal
          isOpenMessageModal={isOpenMessageModal}
          onCloseMessageModal={() => setIsOpenMessageModal(false)}
          messageTitle={messageTitle}
          messageText={messageText}
          messageRouterRedirection={messageRouterRedirection}
          selectedNavBarOption={selectedNavBarOption}
        />

        <div className="w-full px-6 sm:w-[500px] sm:px-0">
          <form
            className="flex flex-col items-center mx-auto gap-6"
            onSubmit={formik.handleSubmit}
          >
            <input
              type="hidden"
              name="businessName"
              value={formik.values.businessName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <Input
              label="Título del descuento"
              placeholder=""
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              minLength={3}
            />
            {formik.touched.title && formik.errors.title ? (
              <p className="text-red-700">{formik.errors.title}</p>
            ) : null}

            <div className="w-full flex justify-start text-sm font-normal">
              <label className="text-sm ml-[15px] mb-[-10px] font-medium text-black">
                Descripción del descuento
              </label>
            </div>
            <textarea
              id="message"
              name="description"
              placeholder="Haz una descripción de tu oferta de descuento de no más de 85 caracteres."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
              className="w-full min-h-24 border-[1px] border-[gray] rounded-[10px] mt-[-10px] p-2 text-base"
              required
            />

            {formik.touched.description && formik.errors.description ? (
              <p className="text-red-700">{formik.errors.description}</p>
            ) : null}

            <div className="w-full">
              <div className="w-full flex justify-start text-sm font-normal mb-1.5">
                <label className="text-sm font-medium text-black ml-3">
                  Precio normal sin descuento
                </label>
              </div>
              <input
                //label="Precio normal sin descuento"
                className="w-full border border-[gray] rounded-[10px] h-[50px] px-3 focus:outline-none focus:border-[2px] no-spin"
                placeholder=""
                type="number"
                name="normalPrice"
                value={formik.values.normalPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                minLength={1}
              />
              {formik.touched.normalPrice && formik.errors.normalPrice ? (
                <p className="text-red-700">{formik.errors.normalPrice}</p>
              ) : null}
            </div>

            <div className="w-full flex justify-start text-sm font-normal">
              <label className="text-sm font-medium text-black ml-3 mb-[-20px]">
                Porcentaje de descuento a aplicar (%)
              </label>
            </div>
            <select
              name="discountAmount"
              value={formik.values.discountAmount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-[50px] border-[1px] border-[gray] rounded-[10px] px-3"
            >
              {[...Array(100).keys()].map((i) => {
                const value = i + 1;
                return (
                  <option
                    key={value}
                    value={value}
                    style={value % 5 === 0 ? { fontWeight: "bold" } : {}}
                  >
                    {value} %
                  </option>
                );
              })}
            </select>
            {formik.touched.discountAmount && formik.errors.discountAmount ? (
              <p className="text-red-700">{formik.errors.discountAmount}</p>
            ) : null}

            <Input
              label="Cargar Imagen"
              placeholder=""
              type="file"
              name="imageURL"
              onChange={(event) => {
                if (event.currentTarget.files && event.currentTarget.files[0]) {
                  formik.setFieldValue(
                    "imageURL",
                    event.currentTarget.files[0]
                  );
                } else {
                  formik.setFieldValue("imageURL", null); // Limpiar el valor si se cancela la selección
                }
              }}
              onBlur={formik.handleBlur}
              value={formik.values.imageURL}
            />
            {formik.touched.imageURL && formik.errors.imageURL ? (
              <p className="text-red-700">{formik.errors.imageURL}</p>
            ) : null}
            

            <div className="w-full px-1 py-3 border-[1px] rounded-lg border-[gray] text-sm">
              <p className="text-center mb-2 font-bold">
                Selecciona la duración del descuento:
              </p>
              <p className="font-semibold mb-5">
              ⚠️ <strong className="mr-1">Importante:</strong>Si cambias la duración de este descuento, se actualizará la fecha de inicio y la cuenta regresiva se reiniciará. Los cambios en el precio, descripción, porcentaje o foto no afectarán la duración original del descuento.
              </p>
              <div className="w-full flex flex-col gap-3">
                <label className="">
                  <input
                    type="radio"
                    name="durationType"
                    value="permanent"
                    checked={isPermanent}
                    //onChange={() => setIsPermanent(true)}
                    onChange={() => {
                      setIsPermanent(true);
                      formik.setFieldValue("validityPeriod", 0); // Resetea validityPeriod en Formik
                    }}
                    className="mr-3"
                  />
                  Permanente (hasta que lo desactives manualmente)
                </label>

                <label>
                  <input
                    type="radio"
                    name="durationType"
                    value="limited"
                    checked={!isPermanent}
                    onChange={() => setIsPermanent(false)}
                    className="mr-3"
                  />
                  Con duración específica (define cuántos días estará activo)
                </label>
              </div>
              {!isPermanent && (
                <div className="w-full">
                  <Input
                    label="Periodo de Validez del descuento (Es opcional, y por días)."
                    type="number"
                    name="validityPeriod"
                    placeholder=""
                    min={0}
                    value={
                      formik.values.validityPeriod !== null &&
                      formik.values.validityPeriod !== undefined
                        ? formik.values.validityPeriod
                        : 0
                    } // Asegúrate de que no sea null o undefined
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {(formik.touched.validityPeriod || formik.submitCount >= 0) &&
                  formik.errors.validityPeriod ? (
                    <p className="text-red-700 text-center mt-1">
                      {formik.errors.validityPeriod}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {/* <div className="w-full">
              <Input
                label="Periodo de Validez del descuento (Es opcional, y por días). Si dejas el valor en 0 el descuento se publicará de manera permanente."
                type="number"
                name="validityPeriod"
                placeholder=""
                min={0}
                value={formik.values.validityPeriod !== null && formik.values.validityPeriod !== undefined ? formik.values.validityPeriod : 0}  // Asegúrate de que no sea null o undefined
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              {(formik.touched.validityPeriod || formik.submitCount >= 0) && formik.errors.validityPeriod ? (
                <p className="text-red-700 text-center mt-1">{formik.errors.validityPeriod}</p>
              ) : null}
            </div> */}

            <Button buttonText={isLoading ? "Enviando..." : "Enviar"} />

            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default FormEditDiscount;
