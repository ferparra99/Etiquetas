package com.etiquetas.cables.cable.api.controller;

import com.etiquetas.cables.cable.application.dto.CableSearchResponse;
import com.etiquetas.cables.cable.application.usecase.SearchCableUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cables")
public class CableController {

    private final SearchCableUseCase searchCable;

    public CableController(SearchCableUseCase searchCable) {
        this.searchCable = searchCable;
    }

    @GetMapping("/search")
    public CableSearchResponse search(@RequestParam("code") String code) {
        return searchCable.search(code);
    }
}
