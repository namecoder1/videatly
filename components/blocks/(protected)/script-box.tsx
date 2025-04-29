import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { ScriptBoxProps } from "@/types/types";

const ScriptBox = async ({ props } : { props: ScriptBoxProps}) => {
	const { idea_id, content, tone, verbosity, target, type, duration, persona, structure } = props;
	const supabase = await createClient();
	const { data: idea, error: ideaError } = await supabase.from('ideas').select('*').eq('id', idea_id).single();
	return (
		<Card>
			<CardHeader>
				<CardTitle>{idea?.title}</CardTitle>
				<CardDescription>{tone}</CardDescription>
			</CardHeader>
		</Card>
	)
}

export default ScriptBox