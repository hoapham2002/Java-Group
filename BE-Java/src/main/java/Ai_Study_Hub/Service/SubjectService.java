package Ai_Study_Hub.Service;

import Ai_Study_Hub.Domain.Subject;
import Ai_Study_Hub.Domain.dto.SubjectDto;
import Ai_Study_Hub.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<SubjectDto> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        return subjects.stream().map(subject -> SubjectDto.builder()
                .subjId(subject.getSubjId())
                .subjName(subject.getSubjName())
                .subjCode(subject.getSubjCode())
                .subjCreatedAt(subject.getSubjCreatedAt())
                .build()).collect(Collectors.toList());
    }
}
