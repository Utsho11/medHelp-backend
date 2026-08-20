import { Server } from "socket.io";
import config from "../config/index.js";

let io = null;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          config.cors_origin.includes(origin) ||
          config.env === "development"
        ) {
          return callback(null, true);
        }
        return callback(new Error("CORS policy violation on Socket.IO"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join role-specific channels
    socket.on("join_role", ({ role, userId }) => {
      if (role === "volunteer") {
        socket.join("volunteers");
        console.log(`👨‍⚕️ Volunteer joined volunteers broadcast room: ${userId}`);
      } else if (role === "patient") {
        socket.join(`patient_${userId}`);
        console.log(`🩹 Patient joined personal room: patient_${userId}`);
      }
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join emergency specific room for live tracking and chat
    socket.on("emergency:join_room", ({ helpId, userId, role }) => {
      if (helpId) {
        socket.join(`emergency_${helpId}`);
        console.log(`🚨 User ${userId} (${role}) joined emergency room: emergency_${helpId}`);
        socket.to(`emergency_${helpId}`).emit("emergency:user_joined", {
          userId,
          role,
          message: `${role} has connected to the emergency channel.`,
        });
      }
    });

    // Volunteer streams live GPS location to patient
    socket.on("emergency:location_update", ({ helpId, latitude, longitude, volunteerId }) => {
      if (helpId && latitude && longitude) {
        socket.to(`emergency_${helpId}`).emit("emergency:volunteer_location", {
          helpId,
          volunteerId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Real-time emergency chat message between responder and patient
    socket.on("emergency:chat_message", ({ helpId, senderId, senderName, senderRole, message }) => {
      if (helpId && message) {
        const payload = {
          helpId,
          senderId,
          senderName,
          senderRole,
          message,
          timestamp: new Date().toISOString(),
        };
        io.to(`emergency_${helpId}`).emit("emergency:chat_message", payload);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Exported Socket event triggers for Controllers
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

export const notifyNewHelpRequest = (helpData) => {
  if (io) {
    io.to("volunteers").emit("emergency:new_request", {
      message: "🚨 URGENT: New medical help request nearby!",
      help: helpData,
      timestamp: new Date().toISOString(),
    });
  }
};

export const notifyHelpAssigned = (helpId, assignmentData) => {
  if (io) {
    // Notify the specific emergency room and the patient
    io.to(`emergency_${helpId}`).emit("emergency:status_assigned", {
      helpId,
      message: "A volunteer is en route to your location.",
      volunteer: assignmentData.volunteer,
      timestamp: new Date().toISOString(),
    });

    if (assignmentData.patientId) {
      io.to(`patient_${assignmentData.patientId}`).emit("emergency:status_assigned", {
        helpId,
        message: "A volunteer is en route to your location.",
        volunteer: assignmentData.volunteer,
        timestamp: new Date().toISOString(),
      });
    }
  }
};

export const notifyHelpCompleted = (helpId, patientId) => {
  if (io) {
    io.to(`emergency_${helpId}`).emit("emergency:status_completed", {
      helpId,
      message: "Emergency service marked as completed.",
      timestamp: new Date().toISOString(),
    });

    if (patientId) {
      io.to(`patient_${patientId}`).emit("emergency:status_completed", {
        helpId,
        message: "Emergency service marked as completed.",
        timestamp: new Date().toISOString(),
      });
    }
  }
};
