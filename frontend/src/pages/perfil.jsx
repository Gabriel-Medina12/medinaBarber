"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const Perfil = ( handleLogout ) => {
  document.title = 'Perfil | Medina Barber'
  const [user, setUser] = useState({
    name: "Gabriel Medina",
    username: "@medinabarber9",
    avatar: "/placeholder.svg?height=100&width=100",
  })

  // Placeholder images for the grid
  const placeholderImages = Array(9).fill("/placeholder.svg?height=150&width=150")

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="user-info">
          <div className="avatar-container">
            <img src={user.avatar || "/placeholder.svg"} alt="Avatar" className="avatar" />
          </div>
          <h3>{user.name}</h3>
          <p className="edit-profile-text">
            <a href="/pages/edit-perfil">Editar perfil</a>
          </p>
        </div>
        <div className="navBar-Corto">
            <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-Contacto">|</p> <a href="/pages/perfil" className="enlace-Contacto nav-corto">Perfil</a>
        </div>
      </div>


      <div className="titulos">
        <h2 className="">PERFIL</h2>
        <hr />
      </div>

      <div className="image-grid">
        {placeholderImages.map((img, index) => (
          <div key={index} className="grid-item">
            <img src={img || "/placeholder.svg"}  />
          </div>
        ))}
      </div>

      <div className="instagram-button">
        <a href="https://instagram.com/medinabarber9" target="_blank" rel="noopener noreferrer">
        <ion-icon name="logo-instagram" className='siguenos-ig'></ion-icon> Síguenos en Instagram
        </a>
      </div>
    </div>
  )
}

export default Perfil



// "use client"

// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

// const Perfil = () => {
//   // Estado para almacenar la información del usuario y manejo de carga/errores
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Suponiendo que el token esta en localStorage para autenticar la petición
//     const token = localStorage.getItem("token");

//     fetch("http://localhost:3000/api/users/profile", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         // Si es necesario, agregar autorización
//         Authorization: `Bearer ${token}`
//       }
//     })
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Error al obtener los datos del perfil");
//         }
//         return res.json();
//       })
//       .then((data) => {
//         // Suponemos que la respuesta tiene la clave 'user'
//         setUser(data.user);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setError("Error al obtener el perfil");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div>Cargando perfil...</div>;
//   if (error) return <div>{error}</div>;
//   if (!user) return null;

//   // Placeholder images para la grilla
//   const placeholderImages = Array(9).fill("/placeholder.svg?height=150&width=150");

//   return (
//     <div className="profile-container">
//       <div className="profile-header">
//         <div className="user-info">
//           <div className="avatar-container">
//             <img
//               src={user.avatar || "/placeholder.svg"}
//               alt="Avatar"
//               className="avatar"
//             />
//           </div>
//           {/* En vez de mostrar user.name se muestra user.userName */}
//           <h3>{user.userName}</h3>
//           <p className="edit-profile-text">
//             <Link to="/pages/edit-perfil">Editar perfil</Link>
//           </p>
//         </div>
//         <div className="navBar-Corto">
//           <Link to="/" className="enlace-Home nav-corto">
//             Inicio
//           </Link>{" "}
//           <p className="enlace-Contacto">|</p>{" "}
//           <Link to="/pages/perfil" className="enlace-Contacto nav-corto">
//             Perfil
//           </Link>
//         </div>
//       </div>

//       <div className="titulos">
//         <h2>PERFIL</h2>
//         <hr />
//       </div>

//       <div className="image-grid">
//         {placeholderImages.map((img, index) => (
//           <div key={index} className="grid-item">
//             <img src={img || "/placeholder.svg"} alt={`Grid item ${index}`} />
//           </div>
//         ))}
//       </div>

//       <div className="instagram-button">
//         <a
//           href="https://instagram.com/medinabarber9"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <ion-icon name="logo-instagram" className="siguenos-ig"></ion-icon>
//           Síguenos en Instagram
//         </a>
//       </div>
//     </div>
//   );
// };

// export default Perfil;