interface WorkItem {
    id: string;
    title: string;
    state: string;
    assignedTo: string;
    organization: string;
    project: string;
    type: string;
    url: string;
    content?: string;
}
