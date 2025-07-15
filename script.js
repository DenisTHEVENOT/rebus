const version = `1.11.5.${rebus.length}` // Version du script, avec le nombre d'images
const sImg = 250
const angle = 5 // Angle max de rotation aléatoire pour les images
const wPopup = 1700 // Largeur de la popup
const hPopup = 1000 // Hauteur de la popup
let popup = null
let tagsFiltred = rebus
let vrac = true // Par défaut, on affiche les cartes en vrac
let son = true // Par défaut, on joue les sons

document.addEventListener('DOMContentLoaded', async () => {
    const input = document.getElementById('phrase')
    const btnGo = document.getElementById('go')
    const btnReset = document.getElementById('reset')
    const btnOpen = document.getElementById('open')
    const btnMenu = document.getElementById('menu')
    const resultat = document.getElementById('resultat')
    const filter = document.getElementById('filter')
    const btnClear = document.getElementById('clear')
    const inputVrac = document.getElementById('vrac')
    const inputSon = document.getElementById('son')
    const inputShowTags = document.getElementById('showtags')
    const inputHidePhrase = document.getElementById('hidephrase')

    // Chargement des sons
    const sons = [
      new Audio('sons/carte01.mp3'),
      new Audio('sons/carte02.mp3'),
      new Audio('sons/carte03.mp3'),
    ]
    sons.forEach(audio => { audio.load() })
    const efface = new Audio('sons/efface.mp3')
    efface.load()

    function genRebus(phrase) {
        const phonemes = phrase.toLowerCase().split(' ')
        let images = []
        resultat.innerHTML = '' // Vide le conteneur avant de le remplir

        if (popup) {
            popup.document.getElementById('resultat').innerHTML = '' // Vide le contenu de la popup
        }

        // ajoute les images/lettres pour chaque phonème
        phonemes.forEach(phoneme => {
            if (phoneme.includes('\'') && phoneme.length > 2) {
                const [mot1, mot2] = phoneme.split('\'')
                if (mot1.length === 1) {
                    images.push(`${mot1}'`) // Ajoute le premier phonème avec l'apostrophe après
                    images.push(getImage(mot2)) // Ajoute le second phonème
                } else {
                    images.push(getImage(mot1)) // Ajoute le premier phonème
                    images.push(`'${mot2}`) // Ajoute le second phonème avec l'apostrophe avant
                }
            } else if (phoneme.length === 1 || (phoneme.length === 2 && phoneme.includes('\''))) {
                images.push(phoneme) // Ajoute le phonème tel quel
            } else {
                images.push(getImage(phoneme))
            }

        })


        // Si le tableau images n'est pas vide, on affiche le rébus images par images
        if (images.length) {
            // Calcul dynamique de la largeur
            let nbr = [5, 9, 10, 13, 14, 15].includes(images.length) ? 5 : 4
            if (images.length > 15) nbr = 6
            resultat.style.width = (nbr * sImg) + 'px'
            if (popup) {
                popup.document.getElementById('resultat').style.width = (nbr * sImg) + 'px'
            }

            // Ajout progressif des images avec délai
            let i = 0
            function addNextImage() {
                const span = creatSpan(images[i])

                addimage(span, resultat)
                if (popup) {
                    addimage(span.cloneNode(true), popup.document.getElementById('resultat'))
                }
                i++
                if (i < images.length) {
                    setTimeout(addNextImage, 300)
                }
            }

            addNextImage()
        } else {
            resultat.innerHTML = '<p>Aucun rébus trouvé pour cette phrase.</p>'
        }
    }

    function getImage(phoneme) {
        if (!phoneme.includes('\'') || phoneme.length > 1) {
            // Recherche dans le tableau rebus
            const found = rebus.find(item => {
                return item.tags.split(',').includes(phoneme)
            })

            if (found) {
                return found.img
            }

            return `_${phoneme}` // Si pas trouvé, retourne un phonème préfixé par _
        }
    }

    function creatSpan(image) {
        const num = Math.floor(Math.random() * (angle * 2 + 1)) - angle // Nombre aléatoire entre -5 et +5
        const rot = vrac ? ` rot${num}` : ''
        const span = document.createElement('span')

        if (image.startsWith('_')) {
            span.className = `noimg${rot}`
            span.append('?')
            const small = document.createElement('small')
            small.textContent = image.replace(/_/g, '')
            span.append(small)
        } else if (image.endsWith('.jpg')) {
            span.className = `img${rot}`
            const img = document.createElement('img')
            img.src = `images/${image}`
            const small = document.createElement('small')
            small.textContent = image.replace('.jpg', '')
            span.append(img)
            span.append(small)
        } else {
            span.className = `lettre${rot}`
            span.append(image.toUpperCase())
        }

        return span
    }

    function addimage(span, parent) {
        if (son) {
            const num = Math.floor(Math.random() * 3)
            sons[num].currentTime = 0 // Réinitialise le son
            sons[num].play() // Joue le son pour chaque image affichée
        }
        parent.append(span)
        setTimeout(() => {
            span.classList.add('show')
        }, 50)
    }

    function updateTags() {
        const tagsContainer = document.getElementById('tags')
        tagsContainer.innerHTML = '' // Vide le conteneur avant de le remplir
        tagsFiltred.forEach(item => {
            const tagSpan = document.createElement('span')
            tagSpan.className = 'tag'
            tagSpan.textContent = item.tags

            tagSpan.addEventListener('click', () => {
                const tag = item.tags.split(',')[0] // Prend le premier tag
                input.value += tag + ' ' // Met à jour l'input avec le tag cliqué
                const image = getImage(tag)
                const span = creatSpan(image)
                addimage(span, resultat)
            })

            tagsContainer.appendChild(tagSpan)
        })
    }

    input.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault() // Empêche le comportement par défaut de l'input
            genRebus(event.target.value)
        }
    })

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            btnClear.click() // Simule le clic sur le bouton de nettoyage
            document.querySelector('aside').classList.remove('opened')
        }
    })

    btnGo.addEventListener('click', () => {
        if (input.value.trim()) {
            genRebus(input.value)
        }
    })

    btnReset.addEventListener('click', () => {
        if (son && input.value.trim() !== '') {
            efface.currentTime = 0 // Réinitialise le son de distribution
            efface.play() // Joue le son de distribution
        }

        input.value = ''
        resultat.innerHTML = ''
        input.focus()

        if (popup) {
            // efface le contenu de la popup
            popup.document.getElementById('resultat').innerHTML = ''

        }
    })

    btnMenu.addEventListener('click', () => {
        document.querySelector('aside').classList.toggle('opened')
        if (document.querySelector('aside').classList.contains('opened')) {
            filter.focus()
        } else {
            input.focus()
        }
    })

    btnOpen.addEventListener('click', () => {
        if (popup && !popup.closed) {
            popup.focus()
            return
        }

        // calcul la position 'top' pour centrer en hauteur la popup
        // 73 pour la hauteur de la barre de titre, url et des bordures
        const top = Math.round((window.screen.height - (hPopup + 73)) / 2)

        popup = window.open(
          'popup.html',
          '',
          `width=1700,height=1000,top=${top},left=110`
        )

        if (popup) {
            popup.addEventListener('DOMContentLoaded', () => {
                popup.document.querySelector('footer code').textContent = version
            })
            // popup.document.close()
            // Quand la popup est fermée, remettre popup à null
            popup.onbeforeunload = () => { popup = null }
        }
    })

    btnClear.addEventListener('click', () => {
        filter.value = ''
        tagsFiltred = rebus
        filter.focus()
        updateTags()
    })

    filter.addEventListener('input', () => {
        const searchTerm = filter.value.toLowerCase().trim()
        if (searchTerm === '') {
            tagsFiltred = rebus
        } else {
            tagsFiltred = rebus.filter(item => {
                return item.tags.toLowerCase().includes(searchTerm)
            })
        }

        // Met à jour les tags affichés
        updateTags()
    })

    inputVrac.addEventListener('change', () => {
        vrac = inputVrac.checked
    })

    inputSon.addEventListener('change', () => {
        son = inputSon.checked
    })

    inputShowTags.addEventListener('change', () => {
        resultat.classList.toggle('show-tags', inputShowTags.checked)
    })

    inputHidePhrase.addEventListener('change', () => {
        document.querySelector('.field').classList.toggle('hide', inputHidePhrase.checked)
    })

    // actions au démarrage
    input.focus()

    if (vrac) {
        inputVrac.checked = true
    }

    if (son) {
        inputSon.checked = true
    }

    updateTags() // Initialiser les tags affichés

    document.querySelector('footer code').textContent = version
})