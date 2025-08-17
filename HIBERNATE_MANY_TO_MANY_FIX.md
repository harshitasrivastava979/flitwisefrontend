# Hibernate Many-to-Many Relationship Fix

## 🚨 The Problem

Hibernate does **NOT** automatically create entries in the `user_group_mapping` join table when you only set the relationship on one side. You must explicitly modify the **owning side** (`Users.groups`) and then save the entity.

## ✅ The Solution

### 1. Fixed `createGroup` Method

The `createGroup` method in `GroupServiceImpl.java` now properly establishes the bidirectional relationship:

```java
// Set users on the group side
savedGroup.setUsers(allUsers);

// Set the group on each user's side (this creates the join table entries)
for (Users user : allUsers) {
    if (user.getUsersGroups() == null) {
        user.setUsersGroups(new ArrayList<>());
    }
    user.getUsersGroups().add(savedGroup);
    userRepo.save(user); // This triggers the insert into user_group_mapping
}
```

### 2. Added Helper Methods

- `addUserToGroup(Long userId, Long groupId)` - Add a user to an existing group
- `isUserInGroup(Long userId, Long groupId)` - Check if a user is in a group

### 3. New API Endpoints

- `POST /api/groups/{groupId}/users/{userId}` - Add user to group
- `GET /api/groups/{groupId}/users/{userId}/check` - Check if user is in group

## 🧪 How to Test

### Test 1: Create a New Group
```bash
curl -X POST http://localhost:8080/api/createGroup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Group",
    "description": "Test Description",
    "currency": "USD",
    "usersList": [
      {"name": "User 1", "mail": "user1@test.com"},
      {"name": "User 2", "mail": "user2@test.com"}
    ]
  }'
```

### Test 2: Check if Users are in Group
```bash
# Replace with actual user and group IDs from Test 1
curl -X GET http://localhost:8080/api/groups/1/users/1/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 3: Add User to Existing Group
```bash
# Replace with actual user and group IDs
curl -X POST http://localhost:8080/api/groups/1/users/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 4: Verify Database
Check the `user_group_mapping` table directly:

```sql
SELECT * FROM user_group_mapping;
```

You should see entries like:
```
user_id | group_id
--------|----------
1       | 1
2       | 1
3       | 1
```

## 🔍 Key Points

1. **Hibernate requires explicit relationship management** - You must add to the owning side's collection
2. **Save the owning entity** - Only `userRepo.save(user)` triggers join table inserts
3. **Bidirectional relationships** - Always maintain both sides for consistency
4. **Null checks** - Always check if collections are null before adding

## 🚀 What This Fixes

- ✅ Group creation now properly creates join table entries
- ✅ Users can be added to existing groups
- ✅ Relationship verification works correctly
- ✅ All existing functionality remains intact

## 📝 Database Schema

The join table structure:
```sql
CREATE TABLE user_group_mapping (
    user_id BIGINT,
    group_id BIGINT,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES users_group(id)
);
```

## 🔧 Troubleshooting

If you still don't see entries in the join table:

1. **Check the logs** - Look for Hibernate SQL output
2. **Verify entity IDs** - Make sure user and group IDs exist
3. **Check transaction boundaries** - Ensure operations are in the same transaction
4. **Verify JPA annotations** - Ensure `@ManyToMany` is properly configured

## 🎯 Next Steps

1. Test the new endpoints
2. Verify join table entries are created
3. Test existing functionality still works
4. Consider adding bulk operations for efficiency 