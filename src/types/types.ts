export interface Message{
    role:'user' | 'assistant';
    content:string;
}

export interface CodeProps{
    node?:any;
    inline?:boolean;
    className?:string;
    children:React.ReactNode
}