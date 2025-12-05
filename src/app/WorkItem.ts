interface WorkItem {
    id: string;
    title: string;
    state: WorkItemState;
    assignedTo: string;
    organization: string;
    project: string;
    type: WorkItemType;
    url: string;
    content?: string;
}

type WorkItemType = 'Bug' | 'User Story';
type WorkItemState = 'New' | 'Active';
