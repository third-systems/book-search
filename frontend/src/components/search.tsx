import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export const Searchbar: React.FC = () => {
  const { query, replace, pathname } = useRouter();
  const [term, setTerm] = useState((query.query as string) ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`)
      .then()
      .catch((e) => console.error(e));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full grow items-center rounded-sm border border-slate-300 py-1 pl-2 pr-6 hover:ring-1 hover:ring-slate-300 md:w-1/2"
    >
      <Search className="mr-2 h-5 w-5 text-gray-600" />
      <input
        autoFocus
        type="text"
        className="w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Search for a book..."
        onChange={handleChange}
        defaultValue={term}
      />
    </form>
  );
};
