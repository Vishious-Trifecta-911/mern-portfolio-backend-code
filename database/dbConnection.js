import mongoose from "mongoose";

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "PortFolio",
    })
    .then(() => {
      console.log("Connected to the Database");
    })
    .catch((error) => {
      console.error(`Failed to connect to the Database ${error}`);
    });
};

export default dbConnection;
