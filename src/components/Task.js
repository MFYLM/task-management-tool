class Task {
    constructor(description, team, due, priority) {
        /**
         * description: string, team: string, due: int in how many hrs + mins left to finish this task, priority: int (0: low, 1: medium, 2: high)
         */

        this.description = description;
        this.team = team;
        this.due = due;
        this.priority = priority;
    }
}


export default Task;