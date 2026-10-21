import { describe, expect, it } from "vitest";
import { aParametros, datosParaCompartir, DESCRIPCION, leerDiseno, TITULO } from "@/lib/compartir";
import { CONFIGURACION_INICIAL } from "@/lib/opciones";

const datos = (link: string) => datosParaCompartir(new URLSearchParams(link));

describe("aParametros", () => {
  it("pasa los parámetros que entrega Next.js a URLSearchParams", () => {
    expect(aParametros({ cuerpo: "rojo", texto: "VM" }).toString()).toBe("cuerpo=rojo&texto=VM");
  });

  it("si un parámetro viene repetido, queda el primero", () => {
    expect(aParametros({ cuerpo: ["rojo", "negro"], suela: undefined }).get("cuerpo")).toBe("rojo");
  });
});

describe("leerDiseno", () => {
  it("vuelve a armar el link limpio y en el mismo orden", () => {
    const { enLimpio } = leerDiseno(new URLSearchParams("texto=v.m&suela=caramelo&cuerpo=rojo"));
    expect(enLimpio).toBe("cuerpo=rojo&suela=caramelo&texto=VM");
  });

  it("ignora lo que no es parte del diseño", () => {
    const { configuracion, texto, enLimpio } = leerDiseno(new URLSearchParams("suela=morado&utm_source=whatsapp"));
    expect(configuracion).toEqual(CONFIGURACION_INICIAL);
    expect(texto).toBe("");
    expect(enLimpio).toBe("");
  });
});

describe("datosParaCompartir", () => {
  it("sin diseño, usa la portada", () => {
    expect(datos("")).toMatchObject({ titulo: TITULO, descripcion: DESCRIPCION, imagen: "/imagen" });
  });

  it("un link con valores inventados también usa la portada", () => {
    expect(datos("cuerpo=morado").imagen).toBe("/imagen");
  });

  it("con diseño, la imagen lleva el diseño en su dirección", () => {
    expect(datos("cuerpo=rojo&texto=vm").imagen).toBe("/imagen?cuerpo=rojo&texto=VM");
  });

  it("la descripción dice el precio del diseño", () => {
    // US$ 120 de base, 10 por la suela caramelo y 5 por el texto
    expect(datos("suela=caramelo&texto=VM").descripcion).toContain("US$ 135");
  });

  it("el texto alternativo describe cada parte y el texto del talón", () => {
    expect(datos("cuerpo=rojo&acabado-suela=brillante&texto=VM").alt).toBe(
      "Mi zapatilla Pisada, de US$ 133. Cuerpo: rojo. Franjas: blanco. Suela: blanco brillante. " +
        "Cordones: blanco. Detalles: naranjo. Texto en el talón: VM.",
    );
  });
});
