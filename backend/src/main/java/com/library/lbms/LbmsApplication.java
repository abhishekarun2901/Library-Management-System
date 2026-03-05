package com.library.lbms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class LbmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(LbmsApplication.class, args);
    }
}