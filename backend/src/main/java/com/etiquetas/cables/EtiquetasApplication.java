package com.etiquetas.cables;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EtiquetasApplication {

    public static void main(String[] args) {
        SpringApplication.run(EtiquetasApplication.class, args);
    }
}
