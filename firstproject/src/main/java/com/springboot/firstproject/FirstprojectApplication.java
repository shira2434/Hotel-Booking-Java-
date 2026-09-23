package com.springboot.firstproject;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class FirstprojectApplication implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "https://shira-hotel-booking.netlify.app")
                .allowedMethods("*");
    }

	public static void main(String[] args) {
		SpringApplication.run(FirstprojectApplication.class, args);
	}

	@Bean//IoC//באופן זה ה
	//bean//יודע לזמן את הפונקציה ולשמור אצלו את המופע שהוחזר בתור
	//כך שנוכל אחר כך להזריק את המופע לפי הצורך
	public ModelMapper getMapper()
	{
		return new ModelMapper();
	}


}
