/**
 * El programa que la terminal de «Sobre mí» muestra ejecutado: imprime los
 * mismos campos, con las mismas etiquetas y en el mismo orden que
 * src/config/developer.ts.
 *
 * La edad es un literal: aquí no se actualiza sola, como en la web.
 * Cómo compilarlo y ejecutarlo: docs/EJEMPLO-JAVA.md.
 */
public record Developer(String fullName, int age, String location, String role, String passion) {

    public static void main(String[] args) {
        Developer developer = new Developer(
            "Jorge Alberto Gómez Chaparro",
            27,
            "Piedecuesta, CO",
            "Full-Stack Developer",
            "Coding the future"
        );

        System.out.println("full name: " + developer.fullName());
        System.out.println("age: " + developer.age());
        System.out.println("location: " + developer.location());
        System.out.println("role: " + developer.role());
        System.out.println("passion: " + developer.passion());
    }
}
