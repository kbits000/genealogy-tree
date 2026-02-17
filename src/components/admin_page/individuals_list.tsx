'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { searchIndividualsServerAction } from "@/lib/actions/admin_server_actions";

type Individual = {
    public_id: string;
    first_name: string;
    parent_name?: string;
    grandparent_name?: string;
    last_name?: string;
    sex: string;
    is_dead: string;
}

export default function IndividualsList({ individuals }: { individuals: Individual[] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Individual[]>(individuals ?? []);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const data = await searchIndividualsServerAction(query);
        setResults(data ?? []);
    }

    return (
        <Box>
            <form onSubmit={handleSearch}>
                <div className="flex flex-1 items-center justify-center p-2">
                    <div className="w-full max-w-lg">
                        <input
                            id="q"
                            name="q"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="my-2 inline w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 leading-5 placeholder-gray-500 focus:border-[#1976d2] focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            placeholder="ابحث.." type="search"
                        />
                        <button type="submit"
                                className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-[#3b8bdb] px-4 py-2 font-medium text-white shadow-sm hover:bg-[#0580fc] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            <SearchIcon/> ابحث
                        </button>
                    </div>
                </div>
            </form>
            <Box className="border border-gray-300">
                <List>
                    {results.map((ind, index) => {
                        const fullName = [ind.first_name, ind.parent_name, ind.grandparent_name, ind.last_name]
                            .filter(Boolean)
                            .join(' ');
                        return (
                            <div key={ind.public_id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    secondaryAction={
                                        <IconButton component={Link} href={`/admin/individuals/${ind.public_id}/edit`} edge="end" aria-label="تعديل">
                                            <EditIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={fullName} />
                                </ListItem>
                            </div>
                        );
                    })}
                </List>
            </Box>
        </Box>
    )
}
