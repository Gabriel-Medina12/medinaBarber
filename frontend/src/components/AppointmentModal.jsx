"use client"
import { User, Scissors, Clock, Calendar, Mail, CreditCard, AlertCircle, Smartphone, Upload, FileText, Check, Receipt} from "lucide-react"
import { useState, useRef, useEffect } from "react" // Añadir useEffect aquí
import axios from "axios";

function AppointmentModal({
  selectedDay,
  currentDate,
  services,
  timeSlots,
  appointmentData,
  handleInputChange,
  handleSubmit,
  handleCloseForm,
  userData,
}) {
  const [step, setStep] = useState(1); // 1: Información básica, 2: Confirmación/Pago, 3: Comprobante de pago
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("efectivo"); // efectivo, tarjeta, etc.
  const [loading, setLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const fileInputRef = useRef(null);
  const [dolarRate, setDolarRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  // Datos de pago móvil
  const [pagoMovilData, setPagoMovilData] = useState({
    telefono: "0412-2911866",
    cedula: "30891515",
    banco: "Banesco (0134)",
    monto: "Cargando..."
  });

  // Obtener tasa del dólar paralelo
  useEffect(() => {
    const fetchDolarRate = async () => {
      setLoadingRate(true);
      try {
        const response = await axios.get('https://ve.dolarapi.com/v1/dolares/paralelo');
        if (response.data && response.data.promedio) {
          const rate = response.data.promedio;
          setDolarRate(rate);
          
          // Calcular el monto en bolívares (5$ * tasa)
          const montoEnBs = (5 * rate).toFixed(2);
          setPagoMovilData(prev => ({
            ...prev,
            monto: `5$ = ${montoEnBs} Bs`
          }));
        } else {
          setPagoMovilData(prev => ({
            ...prev,
            monto: "5$ a paralelo (Error al cargar tasa)"
          }));
        }
      } catch (error) {
        console.error("Error al obtener tasa del dólar:", error);
        setPagoMovilData(prev => ({
          ...prev,
          monto: "5$ a paralelo (Error al cargar tasa)"
        }));
      } finally {
        setLoadingRate(false);
      }
    };

    fetchDolarRate();
  }, []);

  // Añadir esta validación de fecha pasada
  useEffect(() => {
    if (userData) {
      // Crear una copia del objeto appointmentData
      const updatedData = { ...appointmentData };
      
      // Actualizar solo si los campos están vacíos o si userData tiene los datos
      if (userData.fullName && (!appointmentData.clientName || appointmentData.clientName === "")) {
        updatedData.clientName = userData.fullName;
      }
      if (userData.email && (!appointmentData.email || appointmentData.email === "")) {
        updatedData.email = userData.email;
      }
      if (updatedData.clientName !== appointmentData.clientName) {
        handleInputChange({
          target: { name: 'clientName', value: updatedData.clientName }
        });
      }
      if (updatedData.email !== appointmentData.email) {
        handleInputChange({
          target: { name: 'email', value: updatedData.email }
        });
      }
    }

    // Crear la fecha seleccionada
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );
    
    // Obtener la fecha actual sin horas/minutos/segundos para comparación justa
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Si la fecha seleccionada es anterior a hoy, cerrar el modal
    if (selectedDate < today) {
      handleCloseForm();
    }
  }, [selectedDay, currentDate, handleCloseForm]);

  // Obtener el nombre del mes
  const getMonthName = (date) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return months[date.getMonth()]
  }

  // Añade esta función auxiliar al principio del componente
  const formatDateToYYYYMMDD = (yearParam, monthParam, dayParam) => {
    // Convertir los parámetros a números
    const y = parseInt(yearParam, 10);
    const m = parseInt(monthParam, 10) + 1; // +1 porque en JS los meses son base 0
    const d = parseInt(dayParam, 10);
    
    // Formatear con padding de ceros
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  };

  // Validar el formulario antes de pasar al siguiente paso
  const validateForm = () => {
    const errors = {};
    
    if (!appointmentData.clientName.trim()) {
      errors.clientName = "El nombre es obligatorio";
    }
    
    if (!appointmentData.email.trim()) {
      errors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(appointmentData.email)) {
      errors.email = "El email no es válido";
    }
    
    if (!appointmentData.service) {
      errors.service = "Debes seleccionar un servicio";
    }
    
    if (!appointmentData.time) {
      errors.time = "Debes seleccionar una hora";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Validar el comprobante de pago
  const validatePaymentProof = () => {
    const errors = {};
    
    if (paymentMethod === "tarjeta") {
      if (!paymentProof) {
        errors.paymentProof = "Debes subir un comprobante de pago";
      }
      
      if (!referenceNumber.trim()) {
        errors.referenceNumber = "El número de referencia es obligatorio";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Avanzar al siguiente paso
  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setStep(2);
    }
  }

  // Volver al paso anterior
  const handlePrevStep = () => {
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
  }

  // Manejar la subida de la imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setFormErrors({...formErrors, paymentProof: 'Solo se permiten imágenes'});
      return;
    }
    
    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({...formErrors, paymentProof: 'El archivo es muy grande (máx 5MB)'});
      return;
    }

    if (file) {
      setPaymentProof(file);
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewImg = document.getElementById('payment-proof-preview');
        if (previewImg) {
          previewImg.src = reader.result;
          previewImg.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Manejar el cambio en el número de referencia
  const handleReferenceChange = (e) => {
    setReferenceNumber(e.target.value);
  }

  const formatFrontendDate = (year, month, day) => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${day} de ${months[month]} de ${year}`;
  };

  // Manejar el envío del comprobante de pago
  const handlePaymentProofSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentProof()) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Campos obligatorios
      formData.append("clientName", appointmentData.clientName);
      formData.append("email", appointmentData.email);
      formData.append("service", appointmentData.service);
      
      // Usar la función auxiliar para crear la fecha correctamente
      const formattedDate = formatDateToYYYYMMDD(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDay
      );
      formData.append("date", formattedDate);
      
      console.log('Enviando fecha en comprobante:', formattedDate); // Log para depuración
      
      formData.append("time", appointmentData.time);
      
      // Campos condicionales
      formData.append("paymentMethod", "tarjeta");
      formData.append("referenceNumber", referenceNumber);
      formData.append("paymentProof", paymentProof);
      
      if (appointmentData.notes) {
        formData.append("notes", appointmentData.notes);
      }

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post("/api/agendar", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setPaymentComplete(true);
      }
    } catch (error) {
      console.error("Detalles del error:", {
        message: error.response?.data?.message,
        error: error.response?.data?.error,
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar el envío final del formulario
  const handleFinalSubmit = (e) => {
    e.preventDefault();

    if(paymentMethod === 'tarjeta') {
      setStep(3);
      return;
    }
    setLoading(true);

    // Usar la función auxiliar para crear la fecha correctamente
    const formattedDate = formatDateToYYYYMMDD(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );
    
    // Crear objeto con todos los datos finales
    const finalData = {
      clientName: appointmentData.clientName,
      email: appointmentData.email,
      service: appointmentData.service,
      time: appointmentData.time,
      notes: appointmentData.notes || '',
      date: formattedDate,
      paymentMethod: paymentMethod
    };
    
    // Si es pago con tarjeta, añadir referencia y comprobante
    if (paymentMethod === 'tarjeta') {
      finalData.referenceNumber = referenceNumber;
      finalData.paymentProof = paymentProof;
    }
    
    console.log('Enviando fecha:', formattedDate); // Log para depuración
    
    // Llamar a la función de envío del componente padre
    handleSubmit(e, finalData);
  }
  
  const selectedDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedDay
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Renderizar el paso de comprobante de pago
  const renderPaymentProofStep = () => {
    if (paymentComplete) {
      return (
        <div className="payment-receipt">
          <div className="receipt-header">
            <Check size={40} className="success-icon" />
            <h4>¡Pago registrado correctamente!</h4>
          </div>
          
          <div className="receipt-details">
            <p className="receipt-message">
              Hemos recibido tu información de pago. El barbero verificará el pago y confirmará tu cita.
              Recibirás un correo electrónico cuando tu cita sea confirmada.
            </p>
            
            <div className="receipt-summary">
              <h5>Resumen de tu cita</h5>
              <div className="receipt-item">
                <strong>Cliente:</strong> {appointmentData.clientName}
              </div>
              <div className="receipt-item">
                <strong>Servicio:</strong> {appointmentData.service}
              </div>
              <div className="receipt-item">
                <strong>Fecha:</strong> {formatFrontendDate(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  selectedDay
                )}
              </div>
              <div className="receipt-item">
                <strong>Hora:</strong> {appointmentData.time}
              </div>
              <div className="receipt-item">
                <strong>Referencia de pago:</strong> {referenceNumber}
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="confirm-button"
              onClick={handleCloseForm}
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <form onSubmit={handlePaymentProofSubmit} className="payment-proof-form">
        <h4>Comprobante de pago</h4>
        
        <p className="payment-proof-info">
          Por favor, sube una captura de pantalla del pago realizado y proporciona el número de referencia.
        </p>
        
        <div className={`form-group ${formErrors.paymentProof ? 'error' : ''}`}>
          <label>
            <Upload size={18} />
            <span>Captura de pantalla del pago</span>
          </label>
          <div 
            className="file-upload-area"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <div className="upload-placeholder">
              <Upload size={24} />
              <span>Haz clic para subir una imagen</span>
            </div>
            <img 
              id="payment-proof-preview" 
              className="payment-proof-preview" 
              style={{ display: paymentProof ? 'block' : 'none' }} 
              alt="Vista previa del comprobante" 
            />
          </div>
          {formErrors.paymentProof && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{formErrors.paymentProof}</span>
            </div>
          )}
        </div>
        
        <div className={`form-group ${formErrors.referenceNumber ? 'error' : ''}`}>
          <label>
            <FileText size={18} />
            <span>Número de referencia</span>
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={handleReferenceChange}
            placeholder="Ingresa el número de referencia del pago"
          />
          {formErrors.referenceNumber && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{formErrors.referenceNumber}</span>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="back-button" onClick={handlePrevStep}>
            Volver
          </button>
          <button 
            type="submit" 
            className="next-button"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              'Registrar pago'
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="appointment-modal-overlay">
      <div className="appointment-modal">
        <div className="modal-header">
        <h3>
          {step === 1 ? "Nueva Cita" : step === 2 ? "Confirmar Cita" : "Comprobante de Pago"} - 
          {formatFrontendDate(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            selectedDay
          )}
        </h3>
          <button className="close-button" onClick={handleCloseForm}>
            ×
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="appointment-form">
            <div className={`form-group ${formErrors.clientName ? 'error' : ''}`}>
              <label>
                <User size={18} />
                <span>Nombre del cliente</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={appointmentData.clientName}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre completo"
                readOnly={userData && userData.fullName}
              />
              {formErrors.clientName && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{formErrors.clientName}</span>
                </div>
              )}
            </div>

            <div className={`form-group ${formErrors.email ? 'error' : ''}`}>
              <label>
                <Mail size={18} />
                <span>Correo electrónico</span>
              </label>
              <input
                type="email"
                name="email"
                value={appointmentData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
              />
              {formErrors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{formErrors.email}</span>
                </div>
              )}
            </div>

            <div className={`form-group ${formErrors.service ? 'error' : ''}`}>
              <label>
                <Scissors size={18} />
                <span>Servicio</span>
              </label>
              <select 
                name="service" 
                value={appointmentData.service} 
                onChange={handleInputChange}
              >
                 <option value="">Seleccionar servicio</option>
                {Array.isArray(services) ? services.map((service) => (
                  <option key={`${service.id}_${service.name}`} value={service.name}>
                    {service.name}
                  </option>
                )) : <option value="">No hay servicios disponibles</option>}
              </select>
              {formErrors.service && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{formErrors.service}</span>
                </div>
              )}
            </div>

            <div className={`form-group ${formErrors.time ? 'error' : ''}`}>
              <label>
                <Clock size={18} />
                <span>Hora</span>
              </label>
              <select 
                name="time" 
                value={appointmentData.time} 
                onChange={handleInputChange}
              >
                <option value="">Seleccionar hora</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {formErrors.time && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{formErrors.time}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                <Calendar size={18} />
                <span>Notas adicionales</span>
              </label>
              <textarea 
                name="notes" 
                value={appointmentData.notes} 
                onChange={handleInputChange} 
                rows={3}
                placeholder="Información adicional o peticiones especiales"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCloseForm}>
                Cancelar
              </button>
              <button type="submit" className="next-button">
                Siguiente
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          <div className="confirmation-step">
            <div className="appointment-summary">
              <h4>Resumen de tu cita</h4>
              
              <div className="summary-item">
                <User size={16} />
                <div>
                  <strong>Cliente:</strong> {appointmentData.clientName}
                </div>
              </div>
              
              <div className="summary-item">
                <Mail size={16} />
                <div>
                  <strong>Email:</strong> {appointmentData.email}
                </div>
              </div>
              
              <div className="summary-item">
                <Scissors size={16} />
                <div>
                  <strong>Servicio:</strong> {appointmentData.service}
                </div>
              </div>
              
              <div className="summary-item">
                <Calendar size={16} />
                <div>
                <strong>Fecha:</strong> {formatFrontendDate(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  selectedDay
                )}
                </div>
              </div>
              
              <div className="summary-item">
                <Clock size={16} />
                <div>
                  <strong>Hora:</strong> {appointmentData.time}
                </div>
              </div>
              
              {appointmentData.notes && (
                <div className="summary-item">
                  <div>
                    <strong>Notas:</strong> {appointmentData.notes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="payment-options">
              <h4>Método de pago</h4>
              
              <div className="payment-selection">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="efectivo"
                    name="paymentMethod"
                    value="efectivo"
                    checked={paymentMethod === "efectivo"}
                    onChange={() => setPaymentMethod("efectivo")}
                  />
                  <label htmlFor="efectivo">Pagar en la barbería</label>
                </div>
                
                <div className="payment-option">
                  <input
                    type="radio"
                    id="tarjeta"
                    name="paymentMethod"
                    value="tarjeta"
                    checked={paymentMethod === "tarjeta"}
                    onChange={() => setPaymentMethod("tarjeta")}
                  />
                  <label htmlFor="tarjeta">Pagar ahora</label>
                </div>
              </div>
              
              {paymentMethod === "tarjeta" && (
                <div className="card-payment-form">
                  <div className="pago-movil-info">
                    <h5>Datos para Pago Móvil</h5>
                    <div className="pago-movil-item">
                      <Smartphone size={16} />
                      <div>
                        <strong>Teléfono:</strong> {pagoMovilData.telefono}
                      </div>
                    </div>
                    <div className="pago-movil-item">
                      <User size={16} />
                      <div>
                        <strong>CI:</strong> {pagoMovilData.cedula}
                      </div>
                    </div>
                    <div className="pago-movil-item">
                      <CreditCard size={16} />
                      <div>
                        <strong>Banco:</strong> {pagoMovilData.banco}
                      </div>
                    </div>
                    <div className="pago-movil-item">
                      <Receipt size={16} />
                      <div>

                        <strong>Monto a pagar:</strong> {loadingRate ? "Calculando..." : pagoMovilData.monto}
                      </div>
                    </div>
                    <p className="payment-note">
                      <AlertCircle size={16} />
                      <span>Por favor, realiza el pago antes de confirmar tu cita y guarda el comprobante.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="terms-agreement">
              <p>
                Al confirmar esta cita, aceptas nuestras políticas de cancelación y términos de servicio.
                Si necesitas cancelar, por favor hazlo con al menos 24 horas de anticipación.
              </p>
            </div>
            
            <div className="form-actions">
              <button type="button" className="back-button" onClick={handlePrevStep}>
                Volver
              </button>
              <button 
                type="button" 
                className="confirm-button"
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Confirmar cita"}
              </button>
            </div>
          </div>
        ) : (
          renderPaymentProofStep()
        )}
      </div>
    </div>
  )
}

export default AppointmentModal
