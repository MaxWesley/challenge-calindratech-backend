import express from "express";
import cors from "cors";
import axios from "axios";

function calculoEuclides(lat1: number, lat2: number, lng1:number, lng2: number) {
  const lat = Math.pow(lat1 - lat2, 2);
  const log = Math.pow(lng1 - lng2, 2);
  return Math.sqrt(lat + log);
}

class App {
  public express: express.Application;

  public constructor() {
    this.express = express();

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.express.use(express.json());
    this.express.use(cors());
  }

  private routes(): void {
    this.express.get("/getDistance", async (req, res) => {
      const address = req.query?.address;

      if (!address)
        return res.status(400).send("O campo address é obrigatório!");

      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            key: "AIzaSyCBp60zgHtEYvt_6yc-lNrX6iFUOIqQfko",
            address,
          },
        }
      );

      const addresses = response.data.results;
      const addressesDistances = [];

      addresses.map((address: any, index: number) => {
        const enderecos_mais_proximos = [];
        const enderecos_mais_distantes = [];

        addresses.map((address2: any, index2: number) => {
          if (index !== index2) {
            const distancia = calculoEuclides(
              address.geometry.location.lat,
              address2.geometry.location.lat,
              address.geometry.location.lng,
              address2.geometry.location.lng
            );
            enderecos_mais_proximos.push({
              endereco: address2.formatted_address,
              distancia,
            });
            enderecos_mais_distantes.push({
              endereco: address2.formatted_address,
              distancia,
            });
          }
        });
        
        addressesDistances.push({
          endereco: address.formatted_address,
          enderecos_mais_proximos: enderecos_mais_proximos.sort(
            (a, b) => a.distancia - b.distancia
          ),
          enderecos_mais_distantes: enderecos_mais_distantes.sort(
            (a, b) => b.distancia - a.distancia
          ),
        });
      });

      res.status(200).json(addressesDistances);
    });
  }
}

export default new App().express;
