// Lista de notarías autorizadas para trabajar con CONECTIA
export interface Notaria {
  id: string
  numero: number
  nombre: string
  licenciado: string
}

export const notariasAutorizadas: Notaria[] = [
  {
    id: 'notaria-100',
    numero: 100,
    nombre: 'Notaría 100',
    licenciado: 'Lic. Jorge Arturo Zepeda Orozco'
  },
  {
    id: 'notaria-65',
    numero: 65,
    nombre: 'Notaría 65',
    licenciado: 'Lic. Pablo Francisco Toriello Arce'
  },
  {
    id: 'notaria-98',
    numero: 98,
    nombre: 'Notaría 98',
    licenciado: 'Lic. Jose Manuel Toriello Arce'
  },
  {
    id: 'notaria-15',
    numero: 15,
    nombre: 'Notaría 15',
    licenciado: 'Lic. Cesar Santos del Muro Amador'
  },
  {
    id: 'notaria-82',
    numero: 82,
    nombre: 'Notaría 82',
    licenciado: 'Lic. Enrique Duran Llamas'
  }
]

// Función para obtener la lista de notarías para un select
export const getNotariasOptions = () => {
  return notariasAutorizadas.map(n => ({
    value: n.id,
    label: `${n.nombre} - ${n.licenciado}`
  }))
}

// Función para obtener una notaría por ID
export const getNotariaById = (id: string): Notaria | undefined => {
  return notariasAutorizadas.find(n => n.id === id)
}
