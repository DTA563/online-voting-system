import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

export function VoteSuccessPage() {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <Card>
        <div className="py-8">
          <span className="text-6xl mb-4 block">🎉</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vote Submitted Successfully!
          </h1>
          
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Your vote has been recorded</p>
            <p className="text-sm mt-1">
              Thank you for participating in the election.
            </p>
          </div>

          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">🔐 Privacy Guarantee</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your vote is completely anonymous</li>
              <li>• No one can trace your vote back to you</li>
              <li>• The system uses time-bucketing to prevent timing attacks</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/results">
              <Button>View Results</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
