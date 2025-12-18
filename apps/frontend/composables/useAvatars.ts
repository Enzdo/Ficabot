export interface Avatar {
  id: string
  name: string
  type: 'dog' | 'cat' | 'rabbit'
  gender: 'female' | 'male'
  image: string
  description: string
  tags: string[]
}

export const useAvatars = () => {
  const { t } = useI18n()

  const avatars = computed<Avatar[]>(() => [
    // Female Avatars
    {
      id: 'nea',
      name: 'Néa',
      type: 'dog',
      gender: 'female',
      image: '/avatars/nea.png',
      description: t('avatars.nea_desc'),
      tags: ['Douce', 'Bienveillante']
    },
    {
      id: 'mia',
      name: 'Mia',
      type: 'cat',
      gender: 'female',
      image: '/avatars/mia.png',
      description: t('avatars.mia_desc'),
      tags: ['Gracieuse', 'Raffinée']
    },
    {
      id: 'ria',
      name: 'Ria',
      type: 'rabbit',
      gender: 'female',
      image: '/avatars/ria.png',
      description: t('avatars.ria_desc'),
      tags: ['Tendre', 'Délicate']
    },
    // Male Avatars
    {
      id: 'neo',
      name: 'Néo',
      type: 'dog',
      gender: 'male',
      image: '/avatars/neo.png',
      description: t('avatars.neo_desc'),
      tags: ['Fidèle', 'Compagnon']
    },
    {
      id: 'mio',
      name: 'Mio',
      type: 'cat',
      gender: 'male',
      image: '/avatars/mio.png',
      description: t('avatars.mio_desc'),
      tags: ['Élégant', 'Mystérieux']
    },
    {
      id: 'rio',
      name: 'Rio',
      type: 'rabbit',
      gender: 'male',
      image: '/avatars/rio.png',
      description: t('avatars.rio_desc'),
      tags: ['Doux', 'Affectueux']
    }
  ])

  const getAvatarById = (id: string) => {
    return avatars.value.find(a => a.id === id)
  }

  return {
    avatars,
    getAvatarById
  }
}
