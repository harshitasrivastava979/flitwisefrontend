package practice.project.splitwise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import practice.project.splitwise.model.UsersGroup;

import java.util.Optional;

public interface GroupRepo extends JpaRepository<UsersGroup, Integer> {

    Optional<UsersGroup> findById(Long groupId);
}
