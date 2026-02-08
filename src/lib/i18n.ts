import type { Language } from "@/components/language-context";

export const COPY = {
  en: {
    nav: {
      home: "Home",
      services: "Services",
      serviceAreas: "Service Areas",
      requestQuote: "Request Quote",
      login: "Login"
    },
    hero: {
      title: "Western New York’s Reliable Snow & Property Maintenance",
      subtitle:
        "Residential and Commercial Snow Removal, Lawn Care, and Property Services you can count on year-round.",
      primaryCta: "Request a Quote",
      secondaryCta: "Call Now",
      phone: "(716) 241-1499",
      cardTitle: "Storm-Ready Operations",
      cardBody:
        "Real-time dispatch, proactive monitoring, and reliable crews across Western NY.",
      metrics: [
        { value: "24/7", label: "Monitoring" },
        { value: '2-3"', label: "Snow Trigger" },
        { value: "Net-15", label: "Commercial" }
      ]
    },
    services: {
      title: "Our Services",
      subtitle:
        "Large jobs get direct coordination with the owner. We keep crews aligned and sites clean.",
      snowTitle: "❄️ Snow Removal",
      snowItems: [
        "Residential Snow Removal",
        "Commercial Parking Lots",
        "Sidewalk Clearing",
        "Ice Management",
        "Storm Monitoring"
      ],
      lawnTitle: "🌱 Lawn & Property Care",
      lawnItems: [
        "Lawn Mowing",
        "Mulch Installation",
        "Hedge & Bush Trimming",
        "Fall Leaf Cleanup",
        "Aeration & Overseeding"
      ],
      maintenanceTitle: "🧹 Property Maintenance",
      maintenanceItems: [
        "Gutter Cleaning",
        "Storm Cleanup",
        "Branch & Debris Removal",
        "Lot Sweeping (Commercial)"
      ]
    },
    whyUs: {
      title: "Why Property Owners Choose Neat Curb",
      items: [
        {
          title: "Reliable Service",
          body: "We monitor storms and respond quickly to keep properties safe and accessible."
        },
        {
          title: "Commercial Ready",
          body: "Trusted by offices, plazas, apartments, and businesses across Western NY."
        },
        {
          title: "Year-Round Care",
          body: "Snow removal in winter. Lawn and property care the rest of the year."
        },
        {
          title: "Local & Responsive",
          body: "Western New York based and ready when you need us."
        }
      ]
    },
    areas: {
      title: "Proudly Serving Western New York",
      list: [
        "Buffalo",
        "Amherst",
        "Cheektowaga",
        "Tonawanda",
        "West Seneca",
        "Niagara Falls",
        "Surrounding Areas"
      ]
    },
    cta: {
      title: "Get Ready Before the Next Storm",
      body:
        "Request your quote today and secure reliable property maintenance for the season.",
      button: "Request a Quote"
    },
    quote: {
      title: "Request a Quote",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      serviceNeeded: "Service Needed",
      propertyClass: "Property Class",
      propertySize: "Property Size",
      snowfall: "Snowfall Forecast",
      serviceDetail: "Service Detail",
      address: "Address",
      message: "Message",
      submit: "Submit",
      sending: "Sending...",
      success: "Thank you! We’ll contact you shortly.",
      error: "Something went wrong. Please try again.",
      services: ["Snow Removal", "Lawn Care", "Property Maintenance", "Commercial Services"],
      propertyClassOptions: { residential: "Residential", commercial: "Commercial" },
      residentialSizes: ["Small Driveway", "Medium Driveway", "Large Driveway"],
      commercialSizes: ["Small Commercial", "Plaza / Multi-suite"],
      accumulationOptions: [
        "2-3 inches (Standard)",
        "3-6 inches (+50%)",
        "6-12 inches (+75%)",
        "12+ inches (+100%)"
      ],
      lawnOptions: [
        "Lawn Mowing",
        "Fall Leaf Cleanup",
        "Mulch Install",
        "Hedge & Bush Trimming",
        "Gutter Cleaning",
        "Aeration & Overseeding",
        "Storm Cleanup"
      ],
      maintenanceOptions: [
        "Gutter Cleaning",
        "Storm Cleanup",
        "Branch & Debris Removal",
        "Lot Sweeping"
      ],
      commercialOptions: [
        "Monthly Lawn Maintenance",
        "Lot Sweeping",
        "Fall Leaf Cleanup",
        "Commercial Mulching",
        "Debris / Storm Removal"
      ],
      selectService: "Select service",
      addressPlaceholder: "Service address"
    },
    footer: {
      name: "Neat Curb",
      tagline: "Reliable Snow & Property Maintenance in Western NY.",
      quickLinks: "Quick Links",
      contact: "Contact",
      phone: "(716) 241-1499",
      email: "neatcurb@gmail.com",
      serviceArea: "Western NY",
      links: {
        services: "Services",
        requestQuote: "Request Quote",
        login: "Login"
      }
    },
    auth: {
      signIn: "Sign in",
      adminAccess: "Admin access for leadership and ops.",
      email: "Email",
      password: "Password",
      signInButton: "Sign In",
      signingIn: "Signing in...",
      backHome: "← Back to Home",
      changePasswordTitle: "Set a New Password",
      changePasswordSub:
        "For security, please create a new admin password before continuing.",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      updatePassword: "Update Password",
      updating: "Updating...",
      passwordMin: "Use at least 10 characters for a strong password.",
      passwordMismatch: "Passwords do not match."
    },
    admin: {
      dashboard: {
        title: "Master Admin Dashboard",
        subtitle: "Unified operations, revenue, and lead intelligence.",
        pill: '2-3 in trigger standard',
        kpis: {
          leads: "Leads",
          activeJobs: "Active Jobs",
          totalJobs: "Total Jobs",
          adminStatus: "Admin Status",
          newRequests: "New requests",
          inProgress: "In progress",
          scheduled: "Scheduled + complete",
          secureAccess: "Secure access"
        },
        snowReady: {
          title: "Snow Ready Control",
          subtitle: "Prepare dispatch batches and tie them to the jobs table.",
          tooltip: "Create a queued snow batch for today's date",
          preparing: "Preparing...",
          activate: "Activate Snow Ready",
          success: "Snow Ready batch created."
        }
      },
      leads: {
        title: "Leads & Sales",
        subtitle:
          "Live lead intake with automated follow-ups and conversion tracking.",
        active: "active",
        emptyTitle: "No leads yet",
        emptyBody: "New leads will appear here in real time.",
        service: "Service",
        detail: "Detail",
        address: "Address",
        estimate: "Estimate",
        message: "Message"
      },
      clients: {
        title: "Clients CRM",
        subtitle: "Full relationship history, cards-on-file, and proof of work.",
        total: "total",
        emptyTitle: "No clients yet",
        emptyBody: "Add a client to begin tracking service history.",
        type: "Type"
      },
      jobs: {
        title: "Jobs",
        subtitle: "Scheduling, tracking, and service delivery.",
        jobs: "jobs",
        emptyTitle: "No jobs yet",
        emptyBody: "Create jobs to track upcoming service.",
        status: "Status",
        scheduled: "Scheduled",
        price: "Price"
      },
      leadIntake: {
        title: "Lead Intake & Pricing Logic",
        subtitle: "The quote engine that turns a lead into revenue immediately.",
        badge: "AI Quote Ready"
      },
      invoices: {
        title: "Invoices & Agreements",
        subtitle: "Billing records and seasonal contract terms.",
        admin: "Admin",
        deadlineTitle: "Seasonal Contract Deadline",
        deadlineBody:
          "Seasonal contracts must be signed by November 1 each year to secure priority routing.",
        termsTitle: "Terms & Agreement",
        termsBody:
          "This area governs seasonal commitments. Late requests are waitlisted or scheduled as per-push."
      },
      audit: {
        title: "Merkle Audit Security",
        subtitle: "Tamper-proof session and financial logs with cryptographic verification.",
        badge: "Root Locked",
        empty:
          "No audit entries yet. Actions like lead creation and Snow Ready will appear here.",
        currentRoot: "Current Merkle Root",
        actor: "Actor",
        timestamp: "Timestamp",
        leaf: "Leaf hash"
      },
      messages: {
        title: "Messages",
        subtitle: "Send email or SMS updates directly from the hub.",
        adminOnly: "Admin Only",
        client: "Client",
        selectClient: "Select a client",
        channel: "Channel",
        subject: "Subject",
        message: "Message",
        send: "Send Message",
        tooltip: "Send email or SMS and log it in Messages + Audit",
        statusClient: "Pick a client first.",
        statusEmail: "Client email is missing.",
        statusPhone: "Client phone is missing.",
        statusAuth: "You are not authenticated.",
        statusFail: "Failed to send message.",
        statusSent: "Message sent.",
        email: "Email",
        sms: "SMS"
      },
      workOrders: {
        title: "Work Orders",
        subtitle: "Crew view for starting, finishing, and uploading proof of work.",
        emptyTitle: "No jobs scheduled",
        emptyBody: "Jobs will appear here once queued.",
        date: "Date",
        status: "Status",
        unscheduled: "Unscheduled",
        viewProof: "View proof of work",
        start: "Start Job",
        finish: "Finish Job",
        upload: "Upload Photo"
      },
      settings: {
        title: "Settings",
        subtitle: "Account, security, and integrations.",
        admin: "Admin",
        adminAccount: "Admin Account",
        interfacePrefs: "Interface Preferences",
        tooltipsOn: "Tooltips are on by default for quick guidance.",
        turnOff: "Turn Tooltips Off",
        turnOn: "Turn Tooltips On",
        integrations: "Integrations",
        integrationsNote: "Supabase, Stripe, and Business AI engine."
      },
      onboarding: {
        title: "First Flight Checklist",
        subtitle:
          "A tailored launch path for Corey — built for snow ops, crew comms, and proof-of-work.",
        steps: [
          {
            title: "Set your admin password",
            detail: "Complete the forced password change to lock in ownership access.",
            action: "Change Password",
            href: "/admin/change-password"
          },
          {
            title: "Add your first client",
            detail: "Start with your top seasonal accounts to build momentum.",
            action: "Add Client",
            href: "/admin/clients"
          },
          {
            title: "Send a test message",
            detail: "Use the Messages tab to send a branded update to yourself.",
            action: "Open Messages",
            href: "/admin/messages"
          },
          {
            title: "Upload proof of work",
            detail: "Use Work Orders to upload a photo and timestamp the service.",
            action: "Work Orders",
            href: "/admin/work-orders"
          },
          {
            title: "Confirm DNS for Resend",
            detail: "Add SPF/DKIM/DMARC in Namecheap so mail lands in inbox.",
            action: "DNS Checklist",
            href: "/admin/settings"
          }
        ]
      }
    },
    adminNav: {
      home: "Home",
      dashboard: "Dashboard",
      leads: "Leads",
      clients: "Clients",
      jobs: "Jobs",
      invoices: "Invoices",
      leadIntake: "Lead Intake",
      messages: "Messages",
      settings: "Settings",
      workOrders: "Work Orders",
      logout: "Logout"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      services: "Servicios",
      serviceAreas: "Áreas de Servicio",
      requestQuote: "Solicitar Cotización",
      login: "Iniciar Sesión"
    },
    hero: {
      title: "Mantenimiento Confiable de Nieve y Propiedades en Western NY",
      subtitle:
        "Remoción de nieve residencial y comercial, cuidado de césped y servicios de propiedad en los que puede confiar todo el año.",
      primaryCta: "Solicitar Cotización",
      secondaryCta: "Llamar Ahora",
      phone: "(716) 241-1499",
      cardTitle: "Operaciones Listas para Tormentas",
      cardBody:
        "Despacho en tiempo real, monitoreo proactivo y equipos confiables en Western NY.",
      metrics: [
        { value: "24/7", label: "Monitoreo" },
        { value: '2-3"', label: "Disparo de Nieve" },
        { value: "Net-15", label: "Comercial" }
      ]
    },
    services: {
      title: "Nuestros Servicios",
      subtitle:
        "Los trabajos grandes reciben coordinación directa con el dueño. Equipos alineados y sitios limpios.",
      snowTitle: "❄️ Remoción de Nieve",
      snowItems: [
        "Remoción de Nieve Residencial",
        "Estacionamientos Comerciales",
        "Limpieza de Acera",
        "Manejo de Hielo",
        "Monitoreo de Tormentas"
      ],
      lawnTitle: "🌱 Cuidado de Césped y Propiedad",
      lawnItems: [
        "Corte de Césped",
        "Instalación de Mulch",
        "Poda de Setos y Arbustos",
        "Limpieza de Hojas",
        "Aireación y Resiembra"
      ],
      maintenanceTitle: "🧹 Mantenimiento de Propiedad",
      maintenanceItems: [
        "Limpieza de Canaletas",
        "Limpieza por Tormenta",
        "Retiro de Ramas y Escombros",
        "Barrido de Lotes (Comercial)"
      ]
    },
    whyUs: {
      title: "Por Qué los Propietarios Eligen Neat Curb",
      items: [
        {
          title: "Servicio Confiable",
          body:
            "Monitoreamos tormentas y respondemos rápido para mantener las propiedades seguras."
        },
        {
          title: "Listo Para Comercial",
          body:
            "Confiado por oficinas, plazas, apartamentos y negocios en Western NY."
        },
        {
          title: "Cuidado Todo el Año",
          body: "Nieve en invierno. Césped y propiedad el resto del año."
        },
        {
          title: "Local y Ágil",
          body: "Basados en Western NY y listos cuando nos necesite."
        }
      ]
    },
    areas: {
      title: "Orgullosamente Sirviendo Western NY",
      list: [
        "Buffalo",
        "Amherst",
        "Cheektowaga",
        "Tonawanda",
        "West Seneca",
        "Niagara Falls",
        "Áreas Cercanas"
      ]
    },
    cta: {
      title: "Prepárate Antes de la Próxima Tormenta",
      body:
        "Solicita tu cotización y asegura mantenimiento confiable para la temporada.",
      button: "Solicitar Cotización"
    },
    quote: {
      title: "Solicitar Cotización",
      name: "Nombre Completo",
      email: "Correo",
      phone: "Teléfono",
      serviceNeeded: "Servicio Necesario",
      propertyClass: "Tipo de Propiedad",
      propertySize: "Tamaño de Propiedad",
      snowfall: "Pronóstico de Nieve",
      serviceDetail: "Detalle del Servicio",
      address: "Dirección",
      message: "Mensaje",
      submit: "Enviar",
      sending: "Enviando...",
      success: "¡Gracias! Nos pondremos en contacto pronto.",
      error: "Algo salió mal. Intente de nuevo.",
      services: [
        "Remoción de Nieve",
        "Cuidado de Césped",
        "Mantenimiento de Propiedad",
        "Servicios Comerciales"
      ],
      propertyClassOptions: { residential: "Residencial", commercial: "Comercial" },
      residentialSizes: ["Entrada Pequeña", "Entrada Mediana", "Entrada Grande"],
      commercialSizes: ["Comercial Pequeño", "Plaza / Multi‑suite"],
      accumulationOptions: [
        "2-3 pulgadas (Estándar)",
        "3-6 pulgadas (+50%)",
        "6-12 pulgadas (+75%)",
        "12+ pulgadas (+100%)"
      ],
      lawnOptions: [
        "Corte de Césped",
        "Limpieza de Hojas",
        "Instalación de Mulch",
        "Poda de Setos y Arbustos",
        "Limpieza de Canaletas",
        "Aireación y Resiembra",
        "Limpieza por Tormenta"
      ],
      maintenanceOptions: [
        "Limpieza de Canaletas",
        "Limpieza por Tormenta",
        "Retiro de Ramas y Escombros",
        "Barrido de Lotes"
      ],
      commercialOptions: [
        "Mantenimiento Mensual de Césped",
        "Barrido de Lotes",
        "Limpieza de Hojas",
        "Mulching Comercial",
        "Retiro de Escombros / Tormenta"
      ],
      selectService: "Seleccionar servicio",
      addressPlaceholder: "Dirección del servicio"
    },
    footer: {
      name: "Neat Curb",
      tagline: "Mantenimiento Confiable de Nieve y Propiedad en Western NY.",
      quickLinks: "Enlaces Rápidos",
      contact: "Contacto",
      phone: "(716) 241-1499",
      email: "neatcurb@gmail.com",
      serviceArea: "Western NY",
      links: {
        services: "Servicios",
        requestQuote: "Solicitar Cotización",
        login: "Iniciar Sesión"
      }
    },
    auth: {
      signIn: "Iniciar Sesión",
      adminAccess: "Acceso administrativo para liderazgo y operaciones.",
      email: "Correo",
      password: "Contraseña",
      signInButton: "Ingresar",
      signingIn: "Ingresando...",
      backHome: "← Volver al Inicio",
      changePasswordTitle: "Configurar Nueva Contraseña",
      changePasswordSub:
        "Por seguridad, crea una nueva contraseña antes de continuar.",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      updatePassword: "Actualizar Contraseña",
      updating: "Actualizando...",
      passwordMin: "Usa al menos 10 caracteres para una contraseña fuerte.",
      passwordMismatch: "Las contraseñas no coinciden."
    },
    admin: {
      dashboard: {
        title: "Panel Maestro",
        subtitle: "Operaciones unificadas, ingresos e inteligencia de leads.",
        pill: 'Estándar de 2-3"',
        kpis: {
          leads: "Prospectos",
          activeJobs: "Trabajos Activos",
          totalJobs: "Trabajos Totales",
          adminStatus: "Estado Admin",
          newRequests: "Nuevas solicitudes",
          inProgress: "En progreso",
          scheduled: "Programado + completo",
          secureAccess: "Acceso seguro"
        },
        snowReady: {
          title: "Control Snow Ready",
          subtitle: "Prepara lotes de despacho y únelos a la tabla de trabajos.",
          tooltip: "Crear un lote de nieve en cola para hoy",
          preparing: "Preparando...",
          activate: "Activar Snow Ready",
          success: "Lote Snow Ready creado."
        }
      },
      leads: {
        title: "Prospectos y Ventas",
        subtitle:
          "Captación en vivo con seguimiento automático y conversión.",
        active: "activos",
        emptyTitle: "Sin prospectos aún",
        emptyBody: "Los nuevos prospectos aparecerán aquí en tiempo real.",
        service: "Servicio",
        detail: "Detalle",
        address: "Dirección",
        estimate: "Estimado",
        message: "Mensaje"
      },
      clients: {
        title: "Clientes CRM",
        subtitle:
          "Historial completo, tarjetas guardadas y prueba de trabajo.",
        total: "total",
        emptyTitle: "Sin clientes aún",
        emptyBody: "Agrega un cliente para empezar a registrar servicios.",
        type: "Tipo"
      },
      jobs: {
        title: "Trabajos",
        subtitle: "Programación, seguimiento y entrega de servicio.",
        jobs: "trabajos",
        emptyTitle: "Sin trabajos aún",
        emptyBody: "Crea trabajos para seguir el servicio.",
        status: "Estado",
        scheduled: "Programado",
        price: "Precio"
      },
      leadIntake: {
        title: "Captación y Lógica de Precios",
        subtitle: "El motor de cotización que convierte leads en ingresos.",
        badge: "Cotización AI Lista"
      },
      invoices: {
        title: "Facturas y Acuerdos",
        subtitle: "Registros de cobro y términos estacionales.",
        admin: "Admin",
        deadlineTitle: "Fecha Límite de Contrato Estacional",
        deadlineBody:
          "Los contratos estacionales deben firmarse antes del 1 de noviembre para asegurar prioridad.",
        termsTitle: "Términos y Acuerdo",
        termsBody:
          "Esta sección regula compromisos estacionales. Solicitudes tardías quedan en espera o por empuje."
      },
      audit: {
        title: "Seguridad de Auditoría Merkle",
        subtitle:
          "Registros a prueba de manipulación con verificación criptográfica.",
        badge: "Raíz Bloqueada",
        empty:
          "Aún no hay entradas. Acciones como creación de leads aparecerán aquí.",
        currentRoot: "Raíz Merkle Actual",
        actor: "Actor",
        timestamp: "Marca de tiempo",
        leaf: "Hash de hoja"
      },
      messages: {
        title: "Mensajes",
        subtitle: "Envía email o SMS directamente desde el hub.",
        adminOnly: "Solo Admin",
        client: "Cliente",
        selectClient: "Selecciona un cliente",
        channel: "Canal",
        subject: "Asunto",
        message: "Mensaje",
        send: "Enviar Mensaje",
        tooltip: "Envía email o SMS y regístralo en Mensajes + Auditoría",
        statusClient: "Primero elige un cliente.",
        statusEmail: "Falta el correo del cliente.",
        statusPhone: "Falta el teléfono del cliente.",
        statusAuth: "No estás autenticado.",
        statusFail: "No se pudo enviar.",
        statusSent: "Mensaje enviado.",
        email: "Email",
        sms: "SMS"
      },
      workOrders: {
        title: "Órdenes de Trabajo",
        subtitle: "Vista de cuadrilla para iniciar, terminar y subir evidencia.",
        emptyTitle: "Sin trabajos programados",
        emptyBody: "Los trabajos aparecerán aquí una vez en cola.",
        date: "Fecha",
        status: "Estado",
        unscheduled: "Sin fecha",
        viewProof: "Ver prueba de trabajo",
        start: "Iniciar Trabajo",
        finish: "Finalizar Trabajo",
        upload: "Subir Foto"
      },
      settings: {
        title: "Ajustes",
        subtitle: "Cuenta, seguridad e integraciones.",
        admin: "Admin",
        adminAccount: "Cuenta Admin",
        interfacePrefs: "Preferencias de Interfaz",
        tooltipsOn: "Los tooltips están activos por defecto.",
        turnOff: "Desactivar Tooltips",
        turnOn: "Activar Tooltips",
        integrations: "Integraciones",
        integrationsNote: "Supabase, Stripe y Business AI."
      },
      onboarding: {
        title: "Lista de Despegue",
        subtitle:
          "Ruta de lanzamiento para Corey — operaciones de nieve, comunicación y evidencia.",
        steps: [
          {
            title: "Configura tu contraseña admin",
            detail: "Completa el cambio obligatorio para asegurar acceso.",
            action: "Cambiar Contraseña",
            href: "/admin/change-password"
          },
          {
            title: "Agrega tu primer cliente",
            detail: "Empieza con cuentas estacionales clave para generar impulso.",
            action: "Agregar Cliente",
            href: "/admin/clients"
          },
          {
            title: "Envía un mensaje de prueba",
            detail: "Usa Mensajes para enviarte una actualización de marca.",
            action: "Abrir Mensajes",
            href: "/admin/messages"
          },
          {
            title: "Sube prueba de trabajo",
            detail: "Usa Órdenes para subir foto y sello de tiempo.",
            action: "Órdenes",
            href: "/admin/work-orders"
          },
          {
            title: "Confirma DNS en Resend",
            detail: "Agrega SPF/DKIM/DMARC en Namecheap para llegar a inbox.",
            action: "Checklist DNS",
            href: "/admin/settings"
          }
        ]
      }
    },
    adminNav: {
      home: "Inicio",
      dashboard: "Tablero",
      leads: "Prospectos",
      clients: "Clientes",
      jobs: "Trabajos",
      invoices: "Facturas",
      leadIntake: "Captación",
      messages: "Mensajes",
      settings: "Ajustes",
      workOrders: "Órdenes",
      logout: "Salir"
    }
  }
} satisfies Record<Language, unknown>;

export function getCopy(language: Language) {
  return COPY[language] || COPY.en;
}
