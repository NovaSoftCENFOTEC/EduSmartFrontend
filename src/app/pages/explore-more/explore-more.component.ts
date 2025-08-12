import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";

interface Curiosity {
    img: string;
    alt: string;
    text: string;
}

@Component({
    selector: "app-explore-more",
    standalone: true,

    imports: [CommonModule],
    templateUrl: "./explore-more.component.html",
    styleUrl: "./explore-more.component.scss",
})
export class ExploreMoreComponent {
    curiosities: Curiosity[] = [
        {
            img: "../../../assets/img/JuanSantamaria.jpg",
            alt: "Juan Santamaría",
            text: "Juan Santamaría: Héroe nacional de Costa Rica, conocido por su valentía en la Campaña Nacional de 1856.",
        },
        {
            img: "../../../assets/img/Chirripo.jpeg",
            alt: "Cerro Chirripó",
            text: "El Cerro Chirripó es la montaña más alta de Costa Rica, con 3,820 metros sobre el nivel del mar.         ",
        },
        {
            img: "../../../assets/img/map.jpg",
            alt: "Mapa Costa Rica",
            text: "Costa Rica está ubicada en América Central, entre Nicaragua y Panamá.",
        },
        {
            img: "../../../assets/img/Biodiversity.jpg",
            alt: "Mapa Costa Rica",
            text: "El 6% de la biodiversidad mundial se encuentra en Costa Rica.",
        },
        {
            img: "../../../assets/img/Army.jpg",
            alt: "Mapa Costa Rica",
            text: "Costa Rica se destaca por no tener ejército desde 1948.",
        },
        {
            img: "../../../assets/img/SarchiCart.jpg",
            alt: "Carretas Típicas",
            text: "Las carretas pintadas a mano son Patrimonio Cultural de la Humanidad según la UNESCO.",
        },
        {
            img: "../../../assets/img/NationalPark.jpg",
            alt: "Parques Nacionales",
            text: "Costa Rica cuenta con 29 parques nacionales y más del 25% de su territorio está protegido.",
        },
        {
            img: "../../../assets/img/Energy.png",
            alt: "Energía Renovable",
            text: "Costa Rica ha funcionado durante más de 300 días consecutivos con energía 100% renovable.",
        },
        {
            img: "../../../assets/img/Coffee.jpeg",
            alt: "Café de Costa Rica",
            text: "El café costarricense es considerado uno de los mejores del mundo por su alta calidad.",
        },
        {
            img: "../../../assets/img/Hummingbird.jpg",
            alt: "Colibrí",
            text: "En Costa Rica se pueden encontrar más de 50 especies diferentes de colibríes.",
        },
    ];

    currentIndex: number = 0;

    get currentCuriosities(): Curiosity[] {
        return this.curiosities.slice(this.currentIndex, this.currentIndex + 2);
    }

    showPrev(): void {
        this.currentIndex =
            (this.currentIndex - 2 + this.curiosities.length) %
            this.curiosities.length;
    }

    showNext(): void {
        this.currentIndex = (this.currentIndex + 2) % this.curiosities.length;
    }

    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({behavior: 'smooth'});
        }
    }

}
